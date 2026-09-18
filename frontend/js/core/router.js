// ==========================================
// Python Adventure - Frontend Router
// ==========================================

(function () {
    "use strict";

    const Router = {
        routes: new Map(),
        currentRoute: null,

        /**
         * تسجيل Route جديد
         */
        register(name, handler) {
            if (!name || typeof handler !== "function") {
                console.warn("[Router] Invalid route:", name);
                return;
            }

            this.routes.set(name, handler);
        },

        /**
         * الانتقال إلى Route
         */
        navigate(name, data = {}) {
            const route = this.routes.get(name);

            if (!route) {
                console.warn("[Router] Route not found:", name);
                return false;
            }

            this.currentRoute = name;

            try {
                route(data);
                return true;
            } catch (error) {
                console.error(`[Router] Error in route "${name}"`, error);
                return false;
            }
        },

        /**
         * معرفة Route الحالي
         */
        getCurrentRoute() {
            return this.currentRoute;
        },

        /**
         * فحص وجود Route
         */
        has(name) {
            return this.routes.has(name);
        },

        /**
         * حذف Route
         */
        remove(name) {
            return this.routes.delete(name);
        },

        /**
         * حذف جميع Routes
         */
        clear() {
            this.routes.clear();
            this.currentRoute = null;
        }
    };

    // جعل Router متاحًا لباقي ملفات المشروع
    window.Router = Router;

    // Routes الأساسية الحالية في Python Adventure
    Router.register("lessons", () => {
        if (typeof openWindow === "function") {
            openWindow("lessonsModal");
        }
    });

    Router.register("inventory", () => {
        if (typeof openWindow === "function") {
            openWindow("inventoryModal");
        }
    });

    Router.register("skills", () => {
        if (typeof openWindow === "function") {
            openWindow("skillsModal");
        }
    });

    Router.register("lab", () => {
        if (typeof openWindow === "function") {
            openWindow("labModal");
        }
    });

    Router.register("map", () => {
        if (typeof openWindow === "function") {
            openWindow("mapModal");
        }
    });

    Router.register("quests", () => {
        if (typeof openWindow === "function") {
            openWindow("questModal");
        }
    });

    Router.register("achievements", () => {
        if (typeof openWindow === "function") {
            openWindow("achievementsModal");
        }
    });

    Router.register("chat", () => {
        if (typeof openChat === "function") {
            openChat();
        }
    });

})();
