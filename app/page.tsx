import { redirect } from "next/navigation";

export default function HomePage() {
  // Landing page raíz — redirigir al dashboard si está autenticado,
  // si no, mostrar página de marketing o login.
  redirect("/auth/login");
}
