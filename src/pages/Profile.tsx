
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const Profile = () => {
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      
      fetchProfile();
    };
    
    checkAuth();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast.error("Não foi possível carregar seu perfil");
      } else if (data) {
        setNome(data.nome || "");
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ nome })
        .eq("id", user.id);
        
      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        toast.error("Não foi possível atualizar seu perfil");
      } else {
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Ocorreu um erro ao atualizar o perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Seu Perfil</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Sair
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
