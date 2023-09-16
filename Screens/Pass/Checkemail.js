import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native'
import React, { useState } from 'react'
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color'
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';

export default function Checkemail() {

    //nav props
    const nav = useNavigation();

    return (
        <View style={styles.wrapper}>


            {/*Description text*/}
            <View style={styles.descText}>
                <Text style={styles.bigText}>Check your email</Text>
                <Text style={styles.smallText}>Check your mail. A reset link has been sent to your email!</Text>
            </View>

            {/*password input*/}
            <View style={styles.mainView}>


                <Image source={require("../../assets/img/mail.png")} resizeMode='contain' style={{ alignSelf: "center", height: 200, width: 200 }} />

                {/*Next Button*/}
                <TouchableOpacity style={styles.nextButton} onPress={() => {
                    Linking.openURL('mailto:');
                    // nav.reset({
                    //     index: 0,
                    //     routes: [{ name: 'Tab' }]
                    // })
                }}>
                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Open email app</Text>
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
        marginTop: 50
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
        marginTop: 40,
        margin: 15
    },
    nextButton: {
        height: 50,
        backgroundColor: AppColor.Blue,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        marginTop: 47
    },


})