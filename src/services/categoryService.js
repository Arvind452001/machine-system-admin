/**
 * Category Service
 * 
 * Manages machine categories (Create, Read, Update, Delete).
 * Provides dynamic categories to AddMachine form and other admin views.
 * Persists data to localStorage with optional backend API sync fallback.
 */

const STORAGE_KEY = "machine_system_categories";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Initial default categories matching the catalog
export const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "Hydraulic forming",
    code: "HYD-01",
    slug: "hydraulic-forming",
    icon: "bi-gear-wide-connected",
    description: "High-tonnage stamping, forging, and heavy hydraulic compression systems.",
    status: "Active",
    displayOrder: 1,
    machineCount: 3,
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-03-10T10:30:00.000Z",
  },
  {
    id: "cat-2",
    name: "Precision cutting",
    code: "CUT-02",
    slug: "precision-cutting",
    icon: "bi-cpu",
    description: "Ultra-high-speed laser, plasma, and precision abrasive cutting units.",
    status: "Active",
    displayOrder: 2,
    machineCount: 4,
    createdAt: "2026-01-16T09:15:00.000Z",
    updatedAt: "2026-03-12T14:20:00.000Z",
  },
  {
    id: "cat-3",
    name: "Industrial mixing",
    code: "MIX-03",
    slug: "industrial-mixing",
    icon: "bi-arrow-repeat",
    description: "Continuous batch fluid, powder, and compound industrial mixing machinery.",
    status: "Active",
    displayOrder: 3,
    machineCount: 2,
    createdAt: "2026-01-18T11:00:00.000Z",
    updatedAt: "2026-02-28T09:45:00.000Z",
  },
  {
    id: "cat-4",
    name: "Material handling",
    code: "MAT-04",
    slug: "material-handling",
    icon: "bi-box-seam",
    description: "Automated loaders, gantry systems, palletizers, and conveyor handling units.",
    status: "Active",
    displayOrder: 4,
    machineCount: 3,
    createdAt: "2026-01-20T13:30:00.000Z",
    updatedAt: "2026-03-01T16:10:00.000Z",
  },
  {
    id: "cat-5",
    name: "Additive & tooling",
    code: "ADD-05",
    slug: "additive-tooling",
    icon: "bi-tools",
    description: "Industrial 3D metal sintering, custom tooling, and additive manufacturing cells.",
    status: "Draft",
    displayOrder: 5,
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
   * If backend is configured and reachable, synchronizes with API.
   */
  getCategories: async (options = {}) => {
    const { search = "", status = "All statuses" } = options;

    // Check localStorage cache
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

    // Optional background try to fetch from API endpoint if available
    try {
      const token = localStorage.getItem("machine_system_auth_token");
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          categories = json.data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        }
      }
    } catch {
      // API not reachable or offline; gracefully proceed with local data
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
    const found = categories.find((c) => String(c.id) === String(id) || c.slug === id);
    if (!found) {
      throw new Error("Category not found");
    }
    return found;
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData) => {
    const categories = categoryService.getCategoriesSync();

    const name = (categoryData.name || "").trim();
    if (!name) {
      throw new Error("Category name is required");
    }

    // Check duplicate name
    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      throw new Error(`A category named "${name}" already exists.`);
    }

    const slug = slugify(categoryData.slug || name);
    const code = (categoryData.code || "").trim().toUpperCase() || `CAT-0${categories.length + 1}`;
    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      code,
      slug,
      icon: categoryData.icon || "bi-gear-wide-connected",
      description: (categoryData.description || "").trim(),
      status: categoryData.status || "Active",
      displayOrder: Number(categoryData.displayOrder) || categories.length + 1,
      machineCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Try API POST if online
    try {
      const token = localStorage.getItem("machine_system_auth_token");
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          Object.assign(newCategory, json.data);
        }
      }
    } catch {
      // offline/fallback
    }

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
    const index = categories.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      throw new Error("Category not found");
    }

    const current = categories[index];

    // If name changed, check uniqueness
    if (
      updatedFields.name &&
      updatedFields.name.toLowerCase() !== current.name.toLowerCase()
    ) {
      const exists = categories.some(
        (c) =>
          String(c.id) !== String(id) &&
          c.name.toLowerCase() === updatedFields.name.trim().toLowerCase()
      );
      if (exists) {
        throw new Error(`A category named "${updatedFields.name}" already exists.`);
      }
    }

    const updated = {
      ...current,
      ...updatedFields,
      name: updatedFields.name ? updatedFields.name.trim() : current.name,
      code: updatedFields.code ? updatedFields.code.trim().toUpperCase() : current.code,
      slug: updatedFields.slug ? slugify(updatedFields.slug) : slugify(updatedFields.name || current.name),
      updatedAt: new Date().toISOString(),
    };

    // Try API PUT
    try {
      const token = localStorage.getItem("machine_system_auth_token");
      await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });
    } catch {
      // offline/fallback
    }

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
    const index = categories.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      throw new Error("Category not found");
    }

    const toDelete = categories[index];

    // Try API DELETE
    try {
      const token = localStorage.getItem("machine_system_auth_token");
      await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // offline/fallback
    }

    const updatedList = categories.filter((c) => String(c.id) !== String(id));
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
