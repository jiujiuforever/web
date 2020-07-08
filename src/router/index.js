import Vue from "vue";
import Router from "vue-router";
import store from "@/store";
import constant from "@/public/constant";

Vue.use(Router);

const routes = [{
        path: "/",
        redirect: constant.userAgent == "web" ? "/login" : "/home"
    },
    {
        path: "/login",
        name: "login",
        component: () =>
            import ("@/views/login")
    },
    {
        path: "/home",
        name: "home",
        component: () =>
            import ("@/views/home"),
        children: [{
                path: "businessConfig",
                name: "businessConfig",
                component: () =>
                    import ("@/views/businessConfig")
            },
            {
                path: "systemManage",
                name: "systemManage",
                component: () =>
                    import ("@/views/systemManage")
            },
            {
                path: "baseData",
                name: "baseData",
                component: () =>
                    import ("@/views/baseData")
            },
            {
                path: "myWork",
                name: "myWork",
                component: () =>
                    import ("@/views/myWork")
            }
        ]
    },
    {
        path: "*",
        redirect: constant.userAgent == "web" ? "/login" : "/home"
    }
];
const router = new Router({
    routes
});
if (constant.userAgent == "web") {
    router.beforeEach((to, from, next) => {
        const token = store.state.app.userData.token;
        // 未登录跳到登录页，已登录刷新保存当前路由
        if (!token && to.name !== "login") {
            next({
                name: "login"
            });
        } else if (!token && to.name == "login") {
            next();
        } else if (token && to.name == "login") {
            next({
                name: store.state.app.currentRoute
            });
        } else {
            next();
        }
    });
}
export default router;