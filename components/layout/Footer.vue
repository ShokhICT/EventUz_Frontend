<template>
  <footer class="bg-surface-900 text-surface-300 pt-16 pb-8">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <NuxtLink to="/" class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span class="text-white font-bold text-lg">E</span>
            </div>
            <span class="text-xl font-bold text-white">EventHub</span>
          </NuxtLink>
          <p class="text-sm text-surface-400 leading-relaxed mb-4">
            Discover, register, and manage events across Uzbekistan. Your gateway to amazing experiences.
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:bg-primary-600 hover:text-white transition-all">
              <span class="text-sm">📱</span>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:bg-primary-600 hover:text-white transition-all">
              <span class="text-sm">💬</span>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:bg-primary-600 hover:text-white transition-all">
              <span class="text-sm">📧</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2.5">
            <li><NuxtLink to="/events" class="text-sm hover:text-primary-400 transition-colors">Browse Events</NuxtLink></li>
            <li><NuxtLink to="/register" class="text-sm hover:text-primary-400 transition-colors">Create Account</NuxtLink></li>
            <li><NuxtLink to="/my-events" class="text-sm hover:text-primary-400 transition-colors">My Events</NuxtLink></li>
            <li><NuxtLink to="/profile" class="text-sm hover:text-primary-400 transition-colors">My Profile</NuxtLink></li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h4 class="text-white font-semibold mb-4">Categories</h4>
          <ul class="space-y-2.5">
            <li><NuxtLink to="/events?category=technology" class="text-sm hover:text-primary-400 transition-colors">Technology</NuxtLink></li>
            <li><NuxtLink to="/events?category=education" class="text-sm hover:text-primary-400 transition-colors">Education</NuxtLink></li>
            <li><NuxtLink to="/events?category=business" class="text-sm hover:text-primary-400 transition-colors">Business</NuxtLink></li>
            <li><NuxtLink to="/events?category=culture" class="text-sm hover:text-primary-400 transition-colors">Culture</NuxtLink></li>
            <li><NuxtLink to="/events?category=sports" class="text-sm hover:text-primary-400 transition-colors">Sports</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-2.5 text-sm">
              <span class="mt-0.5">📍</span>
              <span>Tashkent, Uzbekistan<br>IT Park, Mirzo Ulugbek</span>
            </li>
            <li class="flex items-center gap-2.5 text-sm">
              <span>📞</span>
              <span>+998 (71) 123-45-67</span>
            </li>
            <li class="flex items-center gap-2.5 text-sm">
              <span>✉️</span>
              <span>info@eventhub.uz</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-t border-surface-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-surface-500">© {{ new Date().getFullYear() }} EventHub Uzbekistan. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="text-xs text-surface-500 hover:text-surface-300 transition-colors">Privacy Policy</a>
          <a href="#" class="text-xs text-surface-500 hover:text-surface-300 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>
