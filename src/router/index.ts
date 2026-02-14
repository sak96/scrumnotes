import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import EditView from '../views/EditView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditView,
      props: true,
    },
  ],
});

export default router;