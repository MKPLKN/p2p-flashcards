<template>
  <div class="mx-auto max-w-md">
    <div>
      <div class="block">
        <nav
          class="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          <a
            v-for="(tab, tabIdx) in tabs"
            href="#"
            :key="tab.name"
            @click.prevent="tabOnClick(tab)"
            :class="[
              isActiveTab(tab)
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700',
              tabIdx === 0 ? 'rounded-l-lg' : '',
              tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
              'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10',
            ]"
            :aria-current="isActiveTab(tab) ? 'page' : undefined"
          >
            <span>{{ tab.name }}</span>
            <span
              aria-hidden="true"
              :class="[
                isActiveTab(tab) ? 'bg-indigo-500' : 'bg-transparent',
                'absolute inset-x-0 bottom-0 h-0.5',
              ]"
            />
          </a>
        </nav>
      </div>
    </div>

    <!-- LOGIN START -->
    <div
      v-if="activeTab.name === 'Login'"
      class="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-sm space-y-10">
        <div>
          <h2
            class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
          >
            Login
          </h2>
        </div>
        <form
          class="space-y-6"
          action="#"
          method="POST"
          @submit.prevent="submitAuthUser"
        >
          <div class="relative -space-y-px rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300"
            />
            <div>
              <label for="username" class="sr-only">Username</label>
              <input
                v-model="login.username"
                id="username"
                name="username"
                required=""
                class="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Username"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                v-model="login.password"
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required=""
                class="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <!-- invalidLogin -->
          <div v-if="invalidLogin" class="border border-red-400 p-2 rounded-md">
            <p class="text-red-400 text-center text-sm">
              Incorrect username/password. If you have not yet created a user,
              you can do so in the "Create User" tab.
            </p>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- LOGIN END -->

    <!-- CREATE USER START -->
    <div
      v-if="activeTab.name === 'Create User'"
      class="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-sm space-y-10">
        <div>
          <h2
            class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
          >
            Create User
          </h2>
        </div>
        <form
          class="space-y-6"
          action="#"
          method="POST"
          @submit.prevent="submitCreateUser"
        >
          <div class="relative -space-y-px rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300"
            />
            <div>
              <label for="username" class="sr-only">Username</label>
              <input
                v-model="createUser.username"
                id="username"
                name="username"
                type="text"
                required=""
                class="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Username"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                v-model="createUser.password"
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required=""
                class="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Confirm Password</label>
              <input
                v-model="createUser.confirmPassword"
                id="confirm-password"
                name="confirm-password"
                type="password"
                required=""
                class="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- CREATE USER END -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const { ipcRenderer } = window.electron;

const tabs = ref([
  { name: "Login", href: "#", current: false },
  { name: "Create User", href: "#", current: false },
]);

const activeTab = ref();
const login = ref({ username: "", password: "" });
const createUser = ref({ username: "", password: "", confirmPassword: "" });

setActiveTab("Login");
function setActiveTab(name = "Login") {
  activeTab.value = tabs.value.find((t) => t.name === name);
}
function isActiveTab(tab) {
  return tab.name === activeTab.value.name;
}
function tabOnClick(tab) {
  setActiveTab(tab.name);
}

const invalidLogin = ref(false);
const submitAuthUser = async () => {
  const response = await ipcRenderer.invoke("login-attempt", {
    ...login.value,
  });

  if (response.success) {
    invalidLogin.value = false;
    authStore.setAuthStatus(true);
    router.push({ name: "Home" });
  } else {
    invalidLogin.value = true;
    authStore.setAuthStatus(false);
  }
};
const submitCreateUser = async () => {
  const response = await ipcRenderer.invoke("create-user-attempt", {
    ...createUser.value,
  });

  if (response.success) {
    authStore.setAuthStatus(true);
    router.push({ name: "Home" });
  } else {
    authStore.setAuthStatus(false);
  }
};
</script>
