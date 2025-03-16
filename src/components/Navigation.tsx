'use client'
import React from 'react'; // 确保导入 React
import { useState, useEffect } from 'react'
import { Link, usePathname }from "@/lib/i18n";
import { Github, MenuIcon, Zap, Brain, Target, Calculator, Mouse, Headphones } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import IconImage from "../../public/favicon.svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeModeButton } from "@/components/ThemeModeButton";
import { LocaleButton } from "@/components/LocaleButton";
import {useTranslations} from 'next-intl';
import LoginButton from './LoginButton';
type categoriesType = {
  name: string,
  src: string,
  description: string,
  link: string
}

type navigationProp = {
  categories: categoriesType[]
}


export const Navigation = ({ categories }: navigationProp ) => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');

  const menuItems: {
    label: string;
    href: string;
  }[] = [
    {
      label: t('homeBtn'),
      href: "/",
    },
    {
      label: t('categoryBtn'),
      href: "/category",
    },
    // {
    //   label: t('articleBtn'),
    //   href: "/article",
    // },
    // {
    //   label: t('aboutBtn'),
    //   href: "/about",   
    // },
  ];
  const isMenuItemActive = (href: string) => {
    // console.log(pathname, href);
    return pathname === href;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  
  const size = 30;
  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  })
  ListItem.displayName = "ListItem"
  return (

    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            title="Return to Human Benchmark homepage"
          >
            <Image
              src={IconImage}
              className="block"
              width={size}
              height={size}
              alt="DomainScore"
            />
            <span className="inline-block font-bold">Human Benchmark</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link 
                    href="/" 
                    legacyBehavior 
                    passHref
                    title="Go to homepage"
                  >
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/' === pathname && "font-extrabold")}>
                      {t('homeBtn')}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn('font-medium', '/category' === pathname && "font-extrabold")}
                    title="Browse test categories"
                  >
                    {t('categoryBtn')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                      {categories.map((category) => (
                        <ListItem
                          key={category.name}
                          title={category.name}
                          href={`/category/${category.link}`}
                          className='capitalize'
                          title={`Take ${category.name} test`}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                      <ListItem
                        title={t('moreCategoryBtn')}
                        href={'/category'}
                        className='capitalize border border-muted  bg-gradient-to-b  from-muted/50 to-muted/20'
                        title="View all test categories"
                      >
                        {t('moreCategoryDescription')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem> */}
                {/* <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn('font-medium', '/article' === pathname && "font-extrabold")}>
                    {t('articleBtn')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              AI Kratom
                            </div>
                            <p className="text-xs leading-tight text-muted-foreground">
                              {t('articleDescription')}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/article" title={t('moreArticleBtn')} className='border border-muted  bg-gradient-to-b  from-muted/50 to-muted/20'>
                        {t('moreArticleDescription')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem> */}
                <NavigationMenuItem>
                  <Link href="/tests/reactiontime" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/reactiontime' === pathname && "font-extrabold text-blue-500")}>
                      <Zap className={cn("mr-2 h-4 w-4", '/tests/reactiontime' === pathname && "text-blue-500")} />
                      Reaction Time
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/tests/sequence" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/sequence' === pathname && "font-extrabold text-blue-500")}>
                      <Brain className={cn("mr-2 h-4 w-4", '/tests/sequence' === pathname && "text-blue-500")} />
                      Sequence Memory
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/tests/aim" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/aim' === pathname && "font-extrabold text-blue-500")}>
                      <Target className={cn("mr-2 h-4 w-4", '/tests/aim' === pathname && "text-blue-500")} />
                      Aim Trainer
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/tests/number-memory" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/number-memory' === pathname && "font-extrabold text-blue-500")}>
                      <Calculator className={cn("mr-2 h-4 w-4", '/tests/number-memory' === pathname && "text-blue-500")} />
                      Number Memory
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/tests/chimp" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/chimp' === pathname && "font-extrabold text-blue-500")}>
                      <Mouse className={cn("mr-2 h-4 w-4", '/tests/chimp' === pathname && "text-blue-500")} />
                      Chimp Test
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/tests/audio-reaction-time" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'font-medium', '/tests/audio-reaction-time' === pathname && "font-extrabold text-blue-500")}>
                      <Headphones className={cn("mr-2 h-4 w-4", '/tests/audio-reaction-time' === pathname && "text-blue-500")} />
                      Audio Reaction
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
            
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* 提交工具 
          <Link href="/article/add-new-developer-tools" className='hidden md:block'>
            <Button variant="outline" className='text-sm tracking-tight'>{t('submitToolBtn')}</Button>
          </Link>*/}
          <div className="flex items-center gap-1">
            {/* <ThemeModeButton /> */}
            <LocaleButton/>
            {/* <LoginButton /> */}
          </div>
          {/*<Link
            href={"https://github.com/iAmCorey/devtoolset"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground ml-1"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>*/}
          <Sheet
              open={mobileMenuOpen}
              onOpenChange={(open) => setMobileMenuOpen(open)}
            >
              <SheetTrigger asChild>
                <Button
                  className="md:hidden"
                  size="icon"
                  variant="outline"
                  aria-label="Menu"
                  title="Open navigation menu"
                >
                  <MenuIcon className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[250px]" side="right">
                <div className="flex flex-col items-start justify-center">
                  {menuItems.map((menuItem) => (
                    <Link
                      key={menuItem.href}
                      href={menuItem.href}
                      className={cn(
                        "block px-3 py-2 text-lg",
                        isMenuItemActive(menuItem.href) ? "font-bold" : "",
                      )}
                      title={`Go to ${menuItem.label.toLowerCase()}`}
                    >
                      {menuItem.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  )
}