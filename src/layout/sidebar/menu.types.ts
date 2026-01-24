import { IconType } from "react-icons";

export type MenuItem = {
  label: string;
  to: string;
  icon: IconType;
  permissions?: string[];
};