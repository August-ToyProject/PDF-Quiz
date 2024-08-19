import { useLocation } from "react-router-dom";

export default function UseQuery() {
  return new URLSearchParams(useLocation().search);
}