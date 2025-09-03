import React from "react";
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordRules = z.string()
  .min(8, "Au moins 8 caractères")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/[0-9]/, "Doit contenir un chiffre");

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: passwordRules,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Les mots de passe ne correspondent pas",
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen({ navigation }: any) {
  const { register: signup } = useAuth();
  const { handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 10 }}>Créer un compte</Text>

        <Text>Nom</Text>
        <TextInput
          placeholder="Votre nom"
          autoCapitalize="words"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          onChangeText={(t) => setValue("name", t)}
        />
        {errors.name && <Text style={{ color: "red" }}>{errors.name.message}</Text>}

        <View style={{ height: 12 }} />

        <Text>Email</Text>
        <TextInput
          placeholder="exemple@mail.com"
          autoCapitalize="none"
          inputMode="email"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          onChangeText={(t) => setValue("email", t)}
        />
        {errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}

        <View style={{ height: 12 }} />

        <Text>Mot de passe</Text>
        <TextInput
          placeholder="Au moins 8 caractères, 1 maj, 1 min, 1 chiffre"
          secureTextEntry
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          onChangeText={(t) => setValue("password", t)}
        />
        {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

        <View style={{ height: 12 }} />

        <Text>Confirmer le mot de passe</Text>
        <TextInput
          placeholder="Retapez le mot de passe"
          secureTextEntry
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          onChangeText={(t) => setValue("confirmPassword", t)}
        />
        {errors.confirmPassword && <Text style={{ color: "red" }}>{errors.confirmPassword.message}</Text>}

        <View style={{ height: 16 }} />

        <Button
          title={isSubmitting ? "Création..." : "S'inscrire"}
          onPress={handleSubmit(async (v) => {
            try { await signup(v.name, v.email, v.password); }
            catch (e: any) { Alert.alert("Erreur", e?.response?.data?.message ?? "Impossible de créer le compte"); }
          })}
        />

        <View style={{ height: 12 }} />

        <Text style={{ color: "blue" }} onPress={() => navigation.navigate("Login")}>
          Déjà un compte ? Connexion
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
