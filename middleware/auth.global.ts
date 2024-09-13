export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/new-password",
  ];

  if (to.path === "/") {
    return navigateTo("/dashboard");
  }

  if (
    (to.path === "/auth/new-password" || to.path === "/auth/confirm") &&
    to.query.code
  ) {
    return;
  }

  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo("/auth/login");
  }

  if (user.value && publicRoutes.includes(to.path)) {
    return navigateTo("/dashboard");
  }
});
