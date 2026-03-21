import Header from "../../composants/layouts/Header";
import Footer from "../../composants/layouts/footer";
import ToTop from "../../composants/buttons/toTop";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <ToTop />
    </div>
  );
}

export default MainLayout;