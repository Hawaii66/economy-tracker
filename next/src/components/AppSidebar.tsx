import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { Building, ChevronDown, Folder, Tag, Upload } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { getCategories } from "@/lib/serverCategory";
import { getTags } from "@/lib/serverTag";
import { getCustomers } from "@/lib/serverCustomers";

export default async function AppSidebar() {
  const categories = await getCategories();
  const tags = await getTags();
  const customers = await getCustomers();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                General
                <ChevronDown className="group-data-[state=open]/collapsible:rotate-180 ml-auto transition-transform" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={"/import"}>
                        <Upload /> Import
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <SidebarSeparator />
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Settings
                <ChevronDown className="group-data-[state=open]/collapsible:rotate-180 ml-auto transition-transform" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={"/customers"}>
                        <Building /> Customers
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{customers.length}</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={"/tags"}>
                        <Tag /> Tags
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{tags.length}</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={"/categories"}>
                        <Folder /> Categories
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{categories.length}</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
