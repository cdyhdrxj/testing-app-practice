"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import CategoryIcon from "@mui/icons-material/Category"
import PeopleIcon from "@mui/icons-material/People"
import QuizIcon from "@mui/icons-material/Quiz"

const menuItems = [
  { text: "Тесты", icon: <QuizIcon/>, href: "/admin/tests" },
  { text: "Категории", icon: <CategoryIcon/>, href: "/admin/categories" },
  { text: "Пользователи", icon: <PeopleIcon/>, href: "/admin/users" },
]

export default function ListItems() {
  const pathname = usePathname()

  return (
    <>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
          <ListItemButton selected={pathname === item.href}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text}/>
          </ListItemButton>
        </Link>
      ))}
    </>
  )
}
