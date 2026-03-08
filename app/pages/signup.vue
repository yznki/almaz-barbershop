<script setup lang="ts">
import { toast } from "vue-sonner";
import { authSignupSchema } from "../schemas/auth-signup";
import { getRequestErrorMessage } from "../lib/formatters";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const router = useRouter();
const authApi = useAuthApi();
const session = useAuthSession();

const form = reactive({
  fullName: "",
  email: "",
  password: "",
});

const errors = ref<Record<string, string>>({});
const pending = ref(false);

const submit = async () => {
  const result = authSignupSchema.safeParse(form);

  if (!result.success) {
    errors.value = Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
    return;
  }

  errors.value = {};
  pending.value = true;

  try {
    const auth = await authApi.signup(result.data);
    await session.refreshSession();
    toast.success(auth.emailConfirmationRequired ? "Check your email to confirm your account" : "Account created");
    await router.push(auth.emailConfirmationRequired ? "/login" : "/");
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
      <CardTitle class="text-3xl">Create account</CardTitle>
      <CardDescription>Set up a customer account for quicker access as Almaz’s account features expand.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-5">
      <div class="space-y-2">
        <Label for="fullName">Full name</Label>
        <Input id="fullName" v-model="form.fullName" class="rounded-xl" placeholder="Your full name" />
        <p v-if="errors.fullName" class="text-sm text-destructive">{{ errors.fullName }}</p>
      </div>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" v-model="form.email" type="email" class="rounded-xl" placeholder="you@example.com" />
        <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input id="password" v-model="form.password" type="password" class="rounded-xl" placeholder="At least 8 characters" />
        <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
      </div>
      <Button class="w-full rounded-xl bg-primary text-primary-foreground" :disabled="pending" @click="submit">
        {{ pending ? "Creating account..." : "Create account" }}
      </Button>
      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="text-primary transition hover:text-primary/80">Login</NuxtLink>
      </p>
    </CardContent>
  </Card>
</template>
