<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="h-10 rounded-full border-border/70 bg-card/70 px-2.5">
        <Avatar class="size-7">
          <AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">A</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48 border-border/80 bg-popover/95 backdrop-blur">
      <DropdownMenuItem as-child>
        <NuxtLink to="/login" class="flex w-full items-center gap-2">Login</NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <NuxtLink to="/signup" class="flex w-full items-center gap-2">Signup</NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
