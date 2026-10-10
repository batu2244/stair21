import { navigate } from "@/lib/router";

export default function BackLink({ to = "/", label = "Dashboard" }) {
  return (
    <button className="link back" onClick={() => navigate(to)}>
      <span aria-hidden="true">‹</span> {label}
    </button>
  );
}
