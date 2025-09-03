import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center", padding:20 }}>
      <Text style={{ fontSize:22, fontWeight:"600" }}>Mon profil</Text>
      <Text>Nom : {user?.name}</Text>
      <Text>Email : {user?.email}</Text>

      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
}
