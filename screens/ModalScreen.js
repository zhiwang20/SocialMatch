import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import tw from "twrnc";
import useAuth from "../hooks/useAuth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";

const ModalScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [image, setImage] = useState("");
  const [job, setJob] = useState(null);
  const [age, setAge] = useState(null);

  const incompleteForm = !image || !job || !age;

  const updateUserprofile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      job: job,
      age: age,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        navigation.navigate("Home");
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={tw`flex-1 items-center pt-1`}>
      <Image
        source={{ uri: "https://links.papareact.com/2pf" }}
        style={tw`h-20 w-full`}
        resizeMode="contain"
      />

      <Text style={tw`text-xl text-gray-500 pt-2 font-bold`}>
        Welcome {user.displayName}
      </Text>

      <Text style={tw`text-center p-4 font-bold text-red-400`}>
        Step 1: The Profile Pic
      </Text>
      <TextInput
        value={image}
        selectTextOnFocus={true}
        onChangeText={(text) => setImage(text)}
        style={tw`text-center text-xl pb-2`}
        placeholder="Enter a Profile Pic URL"
      />

      <Text style={tw`text-center p-4 font-bold text-red-400`}>
        Step 2: The Job
      </Text>
      <TextInput
        value={job}
        onChangeText={(text) => setJob(text)}
        style={tw`text-center text-xl pb-2`}
        placeholder="Enter your Occupation"
      />

      <Text style={tw`text-center p-4 font-bold text-red-400`}>
        Step 3: The Age
      </Text>
      <TextInput
        value={age}
        onChangeText={(text) => setAge(text)}
        style={tw`text-center text-xl pb-2`}
        placeholder="Enter your Age"
        maxLength={2}
      />

      <TouchableOpacity
        disabled={incompleteForm}
        onPress={updateUserprofile}
        style={[
          tw`w-64 p-3 rounded-xl absolute bottom-10`,
          incompleteForm ? tw`bg-gray-400` : tw`bg-red-400`,
        ]}
      >
        <Text style={tw`text-center text-white text-xl`}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModalScreen;

// https://assets-global.website-files.com/614c6a3f9b6d6e1ce063f371/6230894e8a27e6f7bb5d75af_Vishal%20Urankar.png
