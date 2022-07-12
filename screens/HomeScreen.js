import {
  Text,
  SafeAreaView,
  View,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import tw from "twrnc";
import useAuth from "../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import generateId from "../lib/generateId";

// const DUMMY_DATA = [
//   {
//     id: 1,
//     firstName: "Vishal",
//     lastName: "Urankar",
//     occupation: "Software Developer",
//     photoURL:
//       "https://assets-global.website-files.com/614c6a3f9b6d6e1ce063f371/6230894e8a27e6f7bb5d75af_Vishal%20Urankar.png",
//     age: 28,
//   },
//   {
//     id: 2,
//     firstName: "Tony",
//     lastName: "Stark",
//     occupation: "Iron Man",
//     photoURL:
//       "https://cdn.vox-cdn.com/thumbor/xRGCpjWk1a5ymuw9tqQy2bngu04=/1400x1050/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/21882543/marvel_avengers_a_day_prologue.jpg",
//     age: 40,
//   },
//   {
//     id: 3,
//     firstName: "Thor",
//     lastName: "Odinson",
//     occupation: "Relam Protector",
//     photoURL:
//       "https://cdn.wionews.com/sites/default/files/2021/01/22/179571-8.jpg",
//     age: 1500,
//   },
// ];

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const navigation = useNavigation();
  const swiperRef = useRef(null);

  useLayoutEffect(() =>
    onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (!snapshot.exists()) {
        navigation.navigate("Modal");
      }
    })
  );

  useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };

    fetchCards();
    return unsub;
  }, [db]);

  const swipeLeft = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    console.log(`You swiped PASS on ${userSwiped.displayName}`);

    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await (
      await getDoc(doc(db, "users", user.uid))
    ).data();

    console.log("coming here");

    // Check if the user swiped on you...
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        console.log({ documentSnapshot });
        if (documentSnapshot.exists()) {
          // user has matched with you before you matched with them...
          // Create a MATCH!
          console.log(`Horray, You MATCHED with ${userSwiped.displayName}`);
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          // User has swiped as first interaction between the two or didn't get swiped on...
          console.log(
            `You swiped PASS on ${userSwiped.displayName} (${userSwiped.job})`
          );
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      {/* header */}
      <View style={tw`items-center justify-between flex-row px-5`}>
        <TouchableOpacity onPress={logout}>
          <Image
            source={{ uri: user.photoURL }}
            style={tw`h-10 w-10 rounded-full`}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image source={require("../logo.png")} style={tw`h-14 w-14`} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 -mt-6`}>
        <Swiper
          ref={swiperRef}
          containerStyle={{ backgroundColor: "transparent" }}
          stackSize={5}
          cardIndex={0}
          verticalSwipe={false}
          animateCardOpacity
          onSwipedLeft={(cardIndex) => swipeLeft(cardIndex)}
          onSwipedRight={(cardIndex) => swipeRight(cardIndex)}
          backgroundColor={"#4FDO49"}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "MATCH",
              style: {
                label: {
                  textAlign: "left",
                  color: "#4DED30",
                },
              },
            },
          }}
          cards={profiles}
          renderCard={(card) =>
            card ? (
              <View
                key={card.id}
                style={tw`relative bg-white h-3/4 rounded-xl`}
              >
                <Image
                  source={{ uri: card.photoURL }}
                  style={tw`absolute top-0 w-full h-full rounded-xl`}
                />

                <View
                  style={[
                    tw`absolute bottom-0 bg-white w-full h-20 flex-row justify-between items-center px-6 py-2 rounded-b-xl`,
                    styles.cardShadow,
                  ]}
                >
                  <View>
                    <Text style={tw`text-xl font-bold`}>
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text style={tw`text-2xl font-bold`}>{card.age}</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  tw`relative bg-white h-3/4 rounded-xl justify-center items-center`,
                  styles.cardShadow,
                ]}
              >
                <Text style={tw`font-bold pb-5`}>No more profiles</Text>
                <Image
                  source={{ uri: "http://links.papareact.com/6gb" }}
                  height={100}
                  style={tw`h-20 w-20`}
                />
              </View>
            )
          }
        />
      </View>

      <View style={tw`flex-row justify-evenly`}>
        <TouchableOpacity
          style={tw`items-center justify-center rounded-full w-16 h-16 bg-red-200`}
          onPress={() => swiperRef.current.swipeLeft()}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center justify-center rounded-full w-16 h-16 bg-green-200`}
          onPress={() => swiperRef.current.swipeRight()}
        >
          <AntDesign name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
