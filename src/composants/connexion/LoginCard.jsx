import { useState } from "react";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email :", email);
    console.log("Password :", password);
  };

  return (
    <div className="absolute w-md top-40 shadow-xl">
      <h2 className="font-black text-5xl mb-5 text-white text-center ">Connexion</h2>
      <div className="bg-white p-5">
        <form onSubmit={handleSubmit}>
          <div>
            <input
              className="bg-gray-200 font-medium px-2 py-3 w-full mb-2 w-full outline-none transition focus:shadow-[inset_3px_0_0_0_#fde047]"
              id="email"
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              className="bg-gray-200 font-medium px-2 py-3 w-full mb-2 w-full outline-none transition focus:shadow-[inset_3px_0_0_0_#fde047]"
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className="mb-3"><a href="" className="underline">Mot de passe oublié?</a></p>
          <button className="mb-5 bg-light-blue text-white  text-xl font-medium w-full px-2 py-3 hover:bg-digital-blue cursor-pointer" type="submit">SE CONNECTER</button>
        </form>
        <p>
        Nouveau ici ? <a href="/register">Devenir membre</a>
      </p>
      </div>
    </div>
  );
}

export default LoginCard;