/**
 * Category Service
 * 
 * Manages machine categories (Create, Read, Update, Delete).
 * Communicates with live backend API (/api/v1/categories) via categoriesApi.
 * Synchronizes with localStorage cache for offline resiliency.
 */

import { categoriesApi } from "../api/categoriesApi";

const STORAGE_KEY = "machine_system_categories";

// Initial default categories
export const INITIAL_CATEGORIES = [];

const slugify = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const notifySubscribers = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("machine-categories-changed"));
  }
};

export const categoryService = {
  /**
   * Get all categories from backend GET /api/v1/categories.
   * Caches in localStorage for smooth navigation.
   */
  getCategories: async (options = {}) => {
    const { search = "", status = "All statuses" } = options;

    let categories = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        categories = JSON.parse(stored);
      }
    } catch {
      categories = [];
    }

    // Fetch from live backend endpoint GET /api/v1/categories
    try {
      const res = await categoriesApi.getCategories();
      const apiItems = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res)
        ? res
        : [];

      if (apiItems.length > 0) {
        const mapped = apiItems.map((item, idx) => {
          const rawName = typeof item === "string" ? item : item.name;
          const itemId = item._id || item.id || `cat-${idx + 1}`;
          const existing = categories.find(
            (c) =>
              (c._id && c._id === itemId) ||
              (c.id && c.id === itemId) ||
              (c.name && c.name.toLowerCase() === rawName.toLowerCase())
          );

          const itemOrder = Number(item.order ?? item.displayOrder ?? existing?.displayOrder ?? (idx + 1));

          return {
            id: itemId,
            _id: item._id || itemId,
            name: rawName,
            code: item.code || existing?.code || `CAT-${String(idx + 1).padStart(2, "0")}`,
            slug: item.slug || existing?.slug || slugify(rawName),
            icon: item.icon || existing?.icon || "bi-gear-wide-connected",
            description:
              item.description !== undefined && item.description !== null
                ? item.description
                : existing?.description || "",
            status: item.isActive === false ? "Draft" : (item.status || existing?.status || "Active"),
            order: itemOrder,
            displayOrder: itemOrder,
            machineCount: item.machineCount ?? existing?.machineCount ?? 0,
            createdAt: item.createdAt || existing?.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || existing?.updatedAt || new Date().toISOString(),
          };
        });

        categories = mapped;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      }
    } catch (err) {
      console.warn("Could not sync categories from backend API:", err.message);
    }

    // Filter categories
    return categories.filter((cat) => {
      const matchesSearch =
        !search ||
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.code && cat.code.toLowerCase().includes(search.toLowerCase())) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        status === "All statuses" || cat.status === status;

      return matchesSearch && matchesStatus;
    });
  },

  /**
   * Synchronous getter for immediate render
   */
  getCategoriesSync: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get active category names list for machine form select dropdowns
   */
  getActiveCategoryNames: () => {
    const categories = categoryService.getCategoriesSync();
    return categories
      .filter((c) => c.status === "Active")
      .map((c) => c.name);
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id) => {
    const categories = categoryService.getCategoriesSync();
    let found = categories.find(
      (c) => String(c.id) === String(id) || String(c._id) === String(id) || c.slug === id
    );

    try {
      const res = await categoriesApi.getCategory(id);
      const item = res?.data || res;
      if (item && item.name) {
        const itemOrder = Number(item.order ?? item.displayOrder ?? found?.order ?? 1);
        found = {
          id: item._id || item.id || id,
          _id: item._id || id,
          name: item.name,
          code: item.code || found?.code || "",
          slug: item.slug || found?.slug || slugify(item.name),
          icon: item.icon || found?.icon || "bi-gear-wide-connected",
          description: item.description ?? found?.description ?? "",
          status: item.isActive === false ? "Draft" : (item.status || "Active"),
          order: itemOrder,
          displayOrder: itemOrder,
          machineCount: item.machineCount ?? found?.machineCount ?? 0,
          createdAt: item.createdAt || found?.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || found?.updatedAt || new Date().toISOString(),
        };
      }
    } catch {
      // Return cached found category if available
    }

    if (!found) {
      throw new Error("Category not found");
    }
    return found;
  },

  /**
   * Create a new category
   * Payload sent to backend:
   * {
   *   "name": "Hydraulic forming-1",
   *   "description": "High-rigidity deep drawing and progressive press systems",
   *   "order": 1
   * }
   */
  createCategory: async (categoryData) => {
    const categories = categoryService.getCategoriesSync();

    const name = (categoryData.name || "").trim();
    if (!name) {
      throw new Error("Category name is required");
    }

    const order = Number(categoryData.order ?? categoryData.displayOrder) || 1;
    const description = (categoryData.description || "").trim();

    // Exact backend payload
    const payload = {
      name,
      description,
      order,
    };

    let backendResult = null;
    try {
      const res = await categoriesApi.createCategory(payload);
      backendResult = res?.data || res;
    } catch (apiErr) {
      console.warn("Backend category creation warning:", apiErr.message);
      const message =
        apiErr.response?.data?.message ||
        apiErr.response?.data?.error ||
        apiErr.message ||
        "Failed to create category.";
      throw new Error(message);
    }

    const newCategory = {
      id: backendResult?._id || `cat-${Date.now()}`,
      _id: backendResult?._id || `cat-${Date.now()}`,
      name,
      code: backendResult?.code || `CAT-0${categories.length + 1}`,
      slug: backendResult?.slug || slugify(name),
      icon: backendResult?.icon || "bi-gear-wide-connected",
      description,
      status: backendResult?.isActive === false ? "Draft" : "Active",
      order,
      displayOrder: order,
      machineCount: 0,
      createdAt: backendResult?.createdAt || new Date().toISOString(),
      updatedAt: backendResult?.updatedAt || new Date().toISOString(),
    };

    const updatedList = [newCategory, ...categories];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifySubscribers();

    return newCategory;
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id, updatedFields) => {
    const categories = categoryService.getCategoriesSync();
    const index = categories.findIndex(
      (c) => String(c.id) === String(id) || String(c._id) === String(id)
    );

    if (index === -1) {
      throw new Error("Category not found");
    }

    const current = categories[index];
    const targetId = current._id || current.id || id;

    const name = updatedFields.name ? updatedFields.name.trim() : current.name;
    const description = (updatedFields.description !== undefined ? updatedFields.description : current.description || "").trim();
    const order = Number(updatedFields.order ?? updatedFields.displayOrder ?? current.order ?? current.displayOrder) || 1;

    // Exact backend payload
    const payload = {
      name,
      description,
      order,
    };

    let backendResult = null;
    try {
      const res = await categoriesApi.updateCategory(targetId, payload);
      backendResult = res?.data || res;
    } catch (apiErr) {
      console.warn("Backend category update warning:", apiErr.message);
      const message =
        apiErr.response?.data?.message ||
        apiErr.response?.data?.error ||
        apiErr.message ||
        "Failed to update category.";
      throw new Error(message);
    }

    const updated = {
      ...current,
      ...updatedFields,
      name,
      description,
      order,
      displayOrder: order,
      updatedAt: backendResult?.updatedAt || new Date().toISOString(),
    };

    categories[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    notifySubscribers();

    return updated;
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id) => {
    const categories = categoryService.getCategoriesSync();
    const index = categories.findIndex(
      (c) => String(c.id) === String(id) || String(c._id) === String(id)
    );

    if (index === -1) {
      throw new Error("Category not found");
    }

    const toDelete = categories[index];
    const targetId = toDelete._id || toDelete.id || id;

    try {
      await categoriesApi.deleteCategory(targetId);
    } catch (apiErr) {
      console.warn("Backend category delete warning:", apiErr.message);
    }

    const updatedList = categories.filter(
      (c) => String(c.id) !== String(id) && String(c._id) !== String(id)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    notifySubscribers();

    return toDelete;
  },
};
