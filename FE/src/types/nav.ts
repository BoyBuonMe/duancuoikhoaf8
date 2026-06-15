export interface NavChild {
  label: string;
  href: string;
}

export interface NavSubItem {
  label: string;
  href: string;
  /** Level-3 sub-items — shown in the right panel when this item is hovered */
  children?: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  subItems?: NavSubItem[];
}
