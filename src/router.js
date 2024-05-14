import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "index",
      component: () => import("./views/Index.vue")
      // props: route => ({ username: route.query.username }),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./views/Login.vue")
    },
    {
      path: "/adminlogin",
      name: "adminlogin",
      component: () => import("./views/AdminLogin.vue")
    },
    {
      path: "/adminindex",
      name: "adminindex",
      component: () => import("./views/AdminIndex.vue"),
      children: [{
        path: '/adminindex/adminhistoricalmessage',
        name: 'adminhistoricalmessage',
        component: () => import("./views/components/AdminHistoricalMessage.vue"),
      },
      {
        path: '/adminindex/adminuserinformation',
        name: 'adminuserinformation',
        component: () => import("./views/components/AdminUserInformation.vue"),
      },
      {
        path: '/adminindex/adminemoji',
        name: 'adminemoji',
        component: () => import("./views/components/AdminEmoji.vue"),
      },
      {
        path: '/adminindex/adminfeedback',
        name: 'adminfeedback',
        component: () => import("./views/components/AdminFeedback.vue"),
      },
      {
        path: '/adminindex/adminuploadpic',
        name: 'adminuploadpic',
        component: () => import("./views/components/AdminUploadPic.vue"),
      },
      {
        path: '/adminindex/adminuserlog',
        name: 'adminuserlog',
        component: () => import("./views/components/AdminUserLog.vue"),
      }
    ]
    }

  ]
});
