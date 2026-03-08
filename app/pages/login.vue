<script setup lang="ts">
import { toast } from "vue-sonner";
import { authLoginSchema } from "../schemas/auth-login";
import { getRequestErrorMessage } from "../lib/formatters";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const loginSchema = authLoginSchema;
const route = useRoute();
const router = useRouter();
const authApi = useAuthApi();
const session = useAuthSession();

const form = reactive({
  email: "",
  password: "",
});

const errors = ref<Record<string, string>>({});
const pending = ref(false);

const redirectTarget = computed(() => (typeof route.query.redirect === "string" ? route.query.redirect : null));

const submit = async () => {
  const result = loginSchema.safeParse(form);

  if (!result.success) {
    errors.value = Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
    return;
  }

  errors.value = {};
  pending.value = true;

  try {
    const auth = await authApi.login(result.data);
    await session.refreshSession();
    toast.success("Welcome back");
    await router.push(redirectTarget.value ?? (auth.role === "admin" ? "/admin" : "/account"));
  } catch (error) {
    toast.error(getRequestErrorMessage(error));
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <Card class="border-border/70 bg-card/70">
    <CardHeader class="space-y-3">
      <CardTitle class="text-3xl">Login</CardTitle>
      <CardDescription>Access your Almaz account or the admin area with the credentials already configured in Supabase.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-5">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="form.email" type="email" class="rounded-xl" placeholder="you@example.com" />
        <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="form.password" type="password" class="rounded-xl" placeholder="••••••••" />
        <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
      </div>
      <Button class="w-full rounded-xl bg-primary text-primary-foreground" :disabled="pending" @click="submit">
        {{ pending ? "Signing in..." : "Sign in" }}
      </Button>
      <p class="text-center text-sm text-muted-foreground">
        New here?
        <NuxtLink to="/signup" class="text-primary transition hover:text-primary/80">Create a customer account</NuxtLink>
      </p>
    </CardContent>
  </Card>
</template>
