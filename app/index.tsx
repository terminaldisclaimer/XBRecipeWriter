import Recipe from "@/library/Recipe";
import RecipeDatabase from "@/library/RecipeDatabase";

import { Divider, Icon, IconElement, Layout, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Platform, Pressable, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { MySafeAreaView } from "@/components/MySafeAreaView";
import { MyStack } from "@/components/MyStack";
import { H1, H6, Paragraph, ScrollView, YStack } from "tamagui";
import RecipeItem from "@/components/RecipeItem";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { toast, ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";
import ImportRecipeComponent from "@/components/ImportRecipeComponent";
import { useShareIntentContext } from "expo-share-intent";
import AndroidNFCDialog from "@/components/AndroidNFCDialog";
import NFC from "@/library/NFC";





export default function HomeScreen() {
  const [recipesJSON, setRecipesJSON] = useState<string>("");
  const [showAndroidNFCDialog, setShowAndroidNFCDialog] = useState(false);
  const [showImportRecipeDialog, setShowImportRecipeDialog] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [xbloomRecipeID, setXBloomRecipeID] = useState<string>("");
  const [key, setKey] = useState(0);
  const router = useRouter();
  const db = new RecipeDatabase();
  const navigation = useNavigation();
  const nfc = new NFC();

  const { hasShareIntent, shareIntent, error, resetShareIntent } = useShareIntentContext();





  //const isFocused = useIsFocused();


  type IconProps = {
    title: string;
    onPress: () => void;
    icon: IconElement;
  }

  useFocusEffect(
    React.useCallback(() => {
      var recipes = db.retrieveAllRecipes();
      if (recipes) {
        setRecipesJSON(JSON.stringify(recipes));
      }
    }, [])
  )

  useEffect(() => {
    if (hasShareIntent) {
      console.log("Share intent received:" + JSON.stringify(shareIntent));

      if (shareIntent.type == "weburl" && shareIntent.webUrl) {
        let url = new URL(shareIntent.webUrl);
        if (url) {
          var id = url.searchParams.get("id");
          if (id) {
            setShowImportRecipeDialog(true);
            setXBloomRecipeID(id);

          }
        }
      }
      // we want to handle share intent event in a specific page
      /*router.replace({
        pathname: "shareintent",
      });*/
    }
  }, [hasShareIntent]);




  useEffect(() => {
    var recipes = db.retrieveAllRecipes();
    // var xbloom = new XBloomRecipe("CMcQuqFPRw9E2xDQvFAZkg==");
    if (recipes) {
      setRecipesJSON(JSON.stringify(recipes));
    }
  }, [key]);

  function getRecipes(): Recipe[] {
    var recipes = [];
    if (recipesJSON) {
      var recipeData = JSON.parse(recipesJSON);
      for (let i = 0; i < recipeData.length; i++) {
        recipes.push(new Recipe(undefined, JSON.stringify(recipeData[i])));
      }
    }
    return recipes;
  }

  const IconButton = (props: IconProps) => (
    <Pressable onPress={props.onPress}>
      {props.icon}
    </Pressable>
  );



  useEffect(() => {

    navigation.setOptions({
      title: 'Recipes',
      headerShown: true,
      headerRight: () => <IconButton onPress={() => readCard()} title="" icon={<AntDesign name="download" size={24} color="black" />
      }></IconButton>,

    })
  }, [navigation]);


  async function onNFCDialogClose() {
    await nfc.close();
    setShowAndroidNFCDialog(false);
  }

  async function progressCallback(progress: number): Promise<string | undefined> {
    setReadProgress(progress);
    return undefined;
  }

  async function readCard() {
    setShowAndroidNFCDialog(true);
    setReadProgress(0);
    try {
      console.log('Read Card')
      var recipe = new Recipe();
      //toast("Hold your phone near the NFC tag");
      var success = await recipe.readCard(nfc, progressCallback);

      if (success) {
        if (Platform.OS === "ios") {
          toast("Recipe read successfully", {
            duration: 4000,
            position: ToastPosition.TOP,
            styles: {
              view: { backgroundColor: 'green' },
            }
          });
        }
        setShowAndroidNFCDialog(false);


        //reenable
        router.push({ pathname: '/editRecipe', params: { recipeJSON: JSON.stringify(recipe) } });
      }
    } catch (e) {
      console.log(e);
      setShowAndroidNFCDialog(false);
      Alert.alert("Error", "Could not read card. Please try again.");
    }

  }

  function forceRefresh() {
    setKey((prev) => prev + 1);
  }

  async function onCloseImportCallback() {
    setShowImportRecipeDialog(false);
    setXBloomRecipeID("");
    // resetShareIntent();
  }

  return (
    <>

      <ScrollView backgroundColor="#dddddd">
        <YStack maxWidth={600} flexDirection="column" >
          {recipesJSON ? getRecipes()
            .sort((a: Recipe, b: Recipe) => a.title.localeCompare(b.title))
            .map((recipe: Recipe, index) => {
              return (
                <RecipeItem rerenderFunction={forceRefresh} key={index} recipe={recipe} onPress={() => {
                  router.push({ pathname: '/editRecipe', params: { recipeJSON: JSON.stringify(recipe) } });
                }}>
                </RecipeItem>
              )
            }) : ""}
        </YStack>
        {showImportRecipeDialog ? <ImportRecipeComponent recipeId={xbloomRecipeID} onClose={() => onCloseImportCallback()} /> : ""}
        {Platform.OS !== "ios" && showAndroidNFCDialog ? <AndroidNFCDialog onClose={() => onNFCDialogClose()} progress={readProgress}></AndroidNFCDialog> : ""}

      </ScrollView>
    </>
  )
}