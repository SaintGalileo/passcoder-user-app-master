import { Image, StyleSheet, Text, ActivityIndicator, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';


export default function NinView() {
    const nav = useNavigation();
    const [verfiLoading, setVerifLoading] = useState(false);
    const [userNin, setUserNIN] = useState({})

    //verify nin button
    async function GetNIN() {
        setVerifLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/nin`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setUserNIN(response);
            setVerifLoading(false);
        }).catch((err) => {
            setVerifLoading(false);
            Toast.show({
                type: 'error',
                text1: "Error",
                text2: "An error occured!"
            })
        })
    }

    useEffect(() => {
        GetNIN()
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetNIN().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
    }, []);

    return (
        <View style={styles.wrapper}>
            {/*Top bar*/}
            <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>NIN</Text>
                    <Text style={{ fontFamily: "lexendLight" }}>Your National Identification Number</Text>
                </View>
                <View />
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {verfiLoading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                    </View>
                ) : (
                    <>
                        <View style={{ margin: 15 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                    <FontAwesome5 name="flag-checkered" size={24} color="grey" />
                                </View>

                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    {
                                        userNin?.data?.nin ? 
                                            <Text style={{ fontFamily: "lexendBold", color: 'grey', fontSize: 16 }}>NIN: {userNin?.data?.nin}</Text> :
                                            <Text style={{ fontFamily: "lexendBold", color: 'grey', fontSize: 15 }}>Verification via VNIN</Text>
                                    }
                                    <Text style={{ color: "grey", fontFamily: "lexendMedium" }}>{userNin?.data?.proof_type}</Text>
                                </View>
                                {userNin?.data?.verified ?(
                                <FontAwesome name="check-circle-o" size={24} color={'green'} /> 
                                ):(
                                    <MaterialIcons name="info-outline" size={24} color="coral" />
                                )}
                                
                            </View>
                        </View>

                        {
                            userNin?.data?.proof ?
                                <View style={{ margin: 15, alignItems: "center", marginBottom: 20 }}>
                                    <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Proof</Text>
                                    {
                                        userNin?.data?.proof.split("/")[4].split(".")[1] !== "PDF" && userNin?.data?.proof.split("/")[4].split(".")[1] !== "pdf" ?
                                            <Image style={{ height: 300, width: 250 }} resizeMode='contain' source={{ uri: userNin?.data?.proof }} /> :
                                            <Text style={{ fontFamily: "lexendLight", marginBottom: 10 }}>{userNin?.data?.proof.split("/")[4]}</Text>
                                    }
                                </View> : ""
                        }
                    </>
                ) }
            </ScrollView> 

                
            {
                !userNin?.data?.verified && !verfiLoading ? (
                    <View style={{ position: "absolute", bottom: 0, marginBottom: 20, alignSelf: "center", margin: 15 }}>
                        <TouchableOpacity onPress={() => { nav.navigate('EditNin', userNin) }} style={{ height: 45, backgroundColor: AppColor.Blue, borderRadius: 8, justifyContent: "center", alignItems: "center", width: 300 }}>
                            <Text style={{ fontFamily: 'lexendMedium', color: "#fff" }}>Edit </Text>
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
    inputStyle: {
        height: 50,
        backgroundColor: "#eee",
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold"
    }
})