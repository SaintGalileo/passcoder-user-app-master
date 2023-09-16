import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Toast from 'react-native-toast-message';
import { AppColor } from '../../utils/Color';

export default function BvnView() {

    const nav = useNavigation();
    const [bvnLoading, setBvnLoading] = useState(true)
    const [userBVN, setUserBvn] = useState({})

    async function GetUserBVN() {
        const userToken = await AsyncStorage.getItem('userToken');
        setBvnLoading(true)
        fetch(`${BaseUrl}/user/bvn`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setUserBvn(response.data);
            setBvnLoading(false);
        }).catch((err) => {
            setBvnLoading(false);
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    useEffect(() => {
        GetUserBVN()
    }, []);
    
    return (
        <View style={styles.wrapper}>

            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>BVN</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>Your Bank Verification Number</Text>
                </View>
                <View />
            </View>


            <View style={{ margin: 15 }}>
                {bvnLoading ? (
                    <View>
                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                    </View>
                ) : (
                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center" }}>
                            <FontAwesome5 name="flag-checkered" size={20} color="grey" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={{ fontFamily: "lexendBold", color: "grey" }}>BVN:{"  "}{userBVN?.bvn}</Text>
                        </View>

                        {userBVN?.verified ? (
                            <FontAwesome name="check-circle-o" size={24} color={'green'} />
                        ) : (
                            <MaterialIcons name="info-outline" size={24} color="coral" />
                        )}

                    </View>
                )}
            </View>

            {
                !userBVN?.verified && !bvnLoading ? (
                    <View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
                        <TouchableOpacity style={styles.btn} onPress={() => nav.navigate("EditBvn")}>
                            <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                ) : ""
            }
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    btn: {
        height: 50,
        backgroundColor: AppColor.Blue,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: 300
    }
})