import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Entypo, Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color'
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function Photo() {
    //image state
    const [image, setImage] = useState(null);

    //function to pick image
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    //nav props
    const nav = useNavigation();

    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={styles.topBar}>
                <Entypo name="chevron-left" size={24} color={AppColor.Blue} />
                <FontAwesome name="question" size={24} color={AppColor.Blue} />
            </View>

            {/*Description text*/}
            <View style={styles.descText}>
                <Text style={styles.bigText}>Finish Setting Up your Profile</Text>
                <Text style={styles.smallText}>Upload a photo of yourself</Text>
            </View>

            {/*body of page*/}
            <View style={styles.mainView}>
                <View style={{ alignSelf: "center" }}>

                    <TouchableOpacity style={styles.addImage}>
                        <MaterialCommunityIcons name="camera-plus-outline" size={30} color={AppColor.White} />
                    </TouchableOpacity>

                    <View style={styles.circle}>
                        {image ? (
                            <Text>hi</Text>
                        ) : (
                            <Feather name="upload-cloud" size={30} color="black" />
                        )}

                    </View>
                </View>

                {/*Next Button*/}
                <TouchableOpacity style={styles.nextButton} >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: AppColor.White
    },
    topBar: {
        margin: 15,
        marginTop: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    descText: {
        margin: 15,
        marginTop: 30
    },
    bigText: {
        fontFamily: "lexendBold",
        color: AppColor.Blue,
        fontSize: 20
    },
    smallText: {
        fontFamily: "lexendMedium",
        color: AppColor.Black,
        marginTop: 10
    },
    mainView: {
        marginTop: 50,
        margin: 15
    },

    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginTop: 55
    },
    nextText: {
        fontFamily: "lexendMedium",
        color: AppColor.White
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center"
    },
    addImage: {
        height: 70,
        width: 70,
        borderRadius: 100,
        backgroundColor: "#2a52be",
        justifyContent: 'center',
        alignItems: "center",
        position: "absolute",
        zIndex: 100,
        bottom: 0,
        right: 0
    }
})