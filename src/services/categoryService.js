/**
 * Category Service
 * 
 * Manages machine categories (Create, Read, Update, Delete).
 * Communicates with live backend API (/api/v1/categories) via categoriesApi.
 * Synchronizes with localStorage cache for offline resiliency.
 */

import { categoriesApi } from "../api/categoriesApi";

const STORAGE_KEY = "machine_system_categories";

// Initial default categories matching the catalog
export const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    _id: "cat-1",
    name: "Hydraulic forming",
    code: "HYD-01",
    slug: "hydraulic-forming",
    icon: "bi-gear-wide-connected",
    description: "High-tonnage stamping, forging, and heavy hydraulic compression systems.",
    status: "Active",
    displayOrder: 1,
    order: 1,
    machineCount: 3,
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-03-10T10:30:00.000Z",
  },
  {
    id: "cat-2",
    _id: "cat-2",
    name: "Precision cutting",
    code: "CUT-02",
    slug: "precision-cutting",
    icon: "bi-cpu",
    description: "Ultra-high-speed laser, plasma, and precision abrasive cutting units.",
    status: "Active",
    displayOrder: 2,
    order: 2,
    machineCount: 4,
    createdAt: "2026-01-16T09:15:00.000Z",
    updatedAt: "2026-03-12T14:20:00.000Z",
  },
  {
    id: "cat-3",
    _id: "cat-3",
    name: "Industrial mixing",
    code: "MIX-03",
    slug: "industrial-mixing",
    icon: "bi-arrow-repeat",
    description: "Continuous batch fluid, powder, and compound industrial mixing machinery.",
    status: "Active",
    displayOrder: 3,
    order: 3,
    machineCount: 2,
    createdAt: "2026-01-18T11:00:00.000Z",
    updatedAt: "2026-02-28T09:45:00.000Z",
  },
  {
    id: "cat-4",
    _id: "cat-4",
    name: "Material handling",
    code: "MAT-04",
    slug: "material-handling",
    icon: "bi-box-seam",
    description: "Automated loaders, gantry systems, palletizers, and conveyor handling units.",
    status: "Active",
    displayOrder: 4,
    order: 4,
    machineCount: 3,
    createdAt: "2026-01-20T13:30:00.000Z",
    updatedAt: "2026-03-01T16:10:00.000Z",
  },
  {
    id: "cat-5",
    _id: "cat-5",
    name: "Additive & tooling",
    code: "ADD-05",
    slug: "additive-tooling",
    icon: "bi-tools",
    description: "Industrial 3D metal sintering, custom tooling, and additive manufacturing cells.",
    status: "Draft",
    displayOrder: 5,
    order: 5,
    machineCount: 0,
    createdAt: "2026-02-05T10:00:00.000Z",
    updatedAt: "2026-02-05T10:00:00.000Z",
  },
];

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
   * Get all categories from localStorage or initialize with defaults.
   * Synchronizes with backend GET /api/v1/categories.
   */
  getCategories: async (options = {}) => {
    const { search = "", status = "All statuses" } = options;

    // Check localStorage cache first
    let categories = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        categories = JSON.parse(stored);
      } else {
        categories = [...INITIAL_CATEGORIES];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      }
    } catch {
      categories = [...INITIAL_CATEGORIES];
    }

    // Fetch and sync from live backend endpoint GET /api/v1/categories
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
        const merged = apiItems.map((item, idx) => {
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

        categories = merged;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      }
    } catch (err) {
      console.warn("Could not sync categories from backend API, using cached data:", err.message);
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
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return [...INITIAL_CATEGORIES];
    } catch {
      return [...INITIAL_CATEGORIES];
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

  /**
   * Reset to initial defaults (utility helper)
   */
  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    notifySubscribers();
    return [...INITIAL_CATEGORIES];
  },
};
