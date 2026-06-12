import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import PageLayout from "../components/PageLayout";
import ErrorMessage from "../components/ErrorMessage";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

  async function chargerUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessageErreur("Erreur lors du chargement des utilisateurs");
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  useEffect(() => {
    chargerUsers();
  }, []);

  async function ajouterUser(event) {
    event.preventDefault();
    setMessageErreur("");

    if (!nom.trim()) {
      setMessageErreur("Veuillez saisir le nom");
      return;
    }

    if (!prenom.trim()) {
      setMessageErreur("Veuillez saisir le prénom");
      return;
    }

    if (!email.trim()) {
      setMessageErreur("Veuillez saisir l'email");
      return;
    }

    if (!role) {
      setMessageErreur("Veuillez sélectionner un rôle");
      return;
    }

    const { error } = await supabase.from("users").insert([
      {
        nom,
        prenom,
        email,
        role,
      },
    ]);

    if (error) {
      setMessageErreur("Erreur lors de l'ajout de l'utilisateur");
      console.error(error);
      return;
    }

    setNom("");
    setPrenom("");
    setEmail("");
    setRole("");

    chargerUsers();
  }

  async function supprimerUser(id) {
    const confirmation = confirm("Supprimer cet utilisateur ?");

    if (!confirmation) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      setMessageErreur("Erreur lors de la suppression");
      console.error(error);
      return;
    }

    chargerUsers();
  }

  return (
    <PageLayout title="Utilisateurs">
      <form className="form-card" onSubmit={ajouterUser} noValidate>
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Choisir un rôle</option>
          <option value="Administrateur">Administrateur</option>
          <option value="Responsable QSE">Responsable QSE</option>
          <option value="Auditeur">Auditeur</option>
          <option value="Utilisateur">Utilisateur</option>
        </select>

        <button type="submit">Ajouter l'utilisateur</button>
      </form>

      <ErrorMessage message={messageErreur} />

      <h2>Liste des utilisateurs</h2>

      <p>Nombre d'utilisateurs : {users.length}</p>

      <div className="list-container">
        {users.map((user) => (
          <div key={user.id} className="item-card">
            <h3>
              {user.prenom} {user.nom}
            </h3>

            <p>
              <strong>Email :</strong> {user.email}
            </p>

            <p>
              <strong>Rôle :</strong> {user.role}
            </p>

            <button onClick={() => supprimerUser(user.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}