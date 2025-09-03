import React from "react";
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const { handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 10 }}>Connexion</Text>

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
          placeholder="********"
          secureTextEntry
          style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
          onChangeText={(t) => setValue("password", t)}
        />
        {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

        <View style={{ height: 16 }} />

        <Button
          title={isSubmitting ? "Connexion..." : "Se connecter"}
          onPress={handleSubmit(async (values) => {
            try { await login(values.email, values.password); }
            catch (e: any) { Alert.alert("Erreur", e?.response?.data?.message ?? "Identifiants invalides"); }
          })}
        />

        <View style={{ height: 12 }} />

        <Text style={{ color: "blue" }} onPress={() => navigation.navigate("Register")}>
          Pas encore de compte ? Inscription
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
