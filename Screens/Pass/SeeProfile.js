import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BaseUrl } from '../../utils/Url'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function SeeProfile() {

    const [passUser, setPassuser] = useState({});

    const [twofaloading, settwofaLoading] = useState(false);

    const [loadingProfile, setLoadingProfile] = useState(false);

    const [twofa, setTwofa] = useState(null)

    const nav = useNavigation()

    //function to get current user from back end
    async function GetCurrentUser() {
        setLoadingProfile(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/profile`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setPassuser(response.data);
            setTwofa(response.data.two_factor_authentication);
            setLoadingProfile(false);
        }).catch((err) => {
            setLoadingProfile(false);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    useEffect(() => {
        GetCurrentUser()
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetCurrentUser().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
    }, []);

    return (
        <View style={styles.ViewDetailModal}>
            {/*Top Bar*/}
            <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                <View>
                    <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Basic Details</Text>
                </View>
                <View />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ margin: 15, }} 
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {
                    loadingProfile ? 
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size={'large'} color={AppColor.Blue} />
                        </View> : 
                        <>
                            {/*Name*/}
                            <View style={{ height: 'auto', backgroundColor: "#fff", marginTop: 20, borderRadius: 10, marginBottom: 20 }}>

                                {
                                    passUser?.nin_verified || passUser?.bvn_verified ? <View /> : 
                                        <TouchableOpacity
                                            disabled={passUser?.nin_verified || passUser?.bvn_verified}
                                            onPress={() => {
                                                nav.navigate('Updatename', { user: passUser })
                                            }}
                                            style={{ backgroundColor: AppColor.Blue, height: 30, padding: 5, flexDirection: "row", alignItems: "center", borderRadius: 8, right: 0, position: "absolute", margin: 15 }}>
                                            <Feather name="edit-3" size={15} color="#fff" />
                                            <Text style={{ fontFamily: "lexendMedium", color: "#fff", marginLeft: 5 }}>Edit</Text>
                                        </TouchableOpacity>
                                }

                                <View style={{ marginTop: 50, margin: 15 }}>
                                    <View>
                                        <Text style={styles.NameStyle}>First Name:<Text style={{ color: "grey" }}>  {passUser?.firstname}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        <Text style={styles.NameStyle}>Middle Name:<Text style={{ color: "grey" }}>  {passUser?.middlename}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        <Text style={styles.NameStyle}>Last Name:<Text style={{ color: "grey" }}>  {passUser?.lastname}</Text></Text>
                                    </View>
                                </View>

                            </View>

                            {/*Number*/}
                            <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10 }}>
                                <Text style={styles.NameStyle}>Phone Number:<Text style={{ color: "grey" }}>  {passUser?.phone_number}</Text></Text>
                                {
                                    passUser?.nin_verified || passUser?.bvn_verified ? <View /> : 
                                        <TouchableOpacity disabled={passUser?.nin_verified || passUser?.bvn_verified} onPress={() => {
                                            nav.navigate('Updatenumber', { Number: passUser.phone_number })
                                        }}
                                            style={{ backgroundColor: AppColor.Blue, height: 30, padding: 5, flexDirection: "row", alignItems: "center", borderRadius: 8, right: 0, position: "absolute", margin: 15 }}>
                                            <Feather name="edit-3" size={15} color="#fff" />
                                            <Text style={{ fontFamily: "lexendMedium", color: "#fff", marginLeft: 5 }}>Edit</Text>
                                        </TouchableOpacity>
                                }
                            </View>

                            {/*DOB and gender*/}
                            <View style={{ height: 'auto', backgroundColor: "#fff", marginTop: 20, borderRadius: 10, marginBottom: 20 }}>
                                
                                {
                                    passUser?.nin_verified || passUser?.bvn_verified ? <View /> : 
                                        <TouchableOpacity
                                            disabled={passUser?.nin_verified || passUser?.bvn_verified}
                                            onPress={() => {
                                                nav.navigate("Updatedob", { user: passUser })
                                            }}
                                            style={{ backgroundColor: AppColor.Blue, height: 30, padding: 5, flexDirection: "row", alignItems: "center", borderRadius: 8, right: 0, position: "absolute", margin: 15 }}>
                                            <Feather name="edit-3" size={15} color="#fff" />
                                            <Text style={{ fontFamily: "lexendMedium", color: "#fff", marginLeft: 5 }}>Edit</Text>
                                        </TouchableOpacity>
                                }

                                <View style={{ marginTop: 50, margin: 15 }}>
                                    <View>
                                        <Text style={styles.NameStyle}>DOB:<Text style={{ color: "grey" }}>  {passUser?.dob}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        <Text style={styles.NameStyle}>Gender:<Text style={{ color: "grey" }}>  {passUser?.gender}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                </View>

                            </View>


                            {/*2FA email and more*/}
                            <View style={{ height: 'auto', backgroundColor: "#fff", marginTop: 20, borderRadius: 10, marginBottom: 20 }}>
                                <View style={{ marginTop: 20, margin: 15 }}>
                                    <View>
                                        <Text style={styles.NameStyle}>Email:<Text style={{ color: "grey" }}>  {passUser?.email}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <View>
                                            <Text style={styles.NameStyle}>Referral ID: <Text style={{ color: "grey" }}> {passUser?.ref_id}</Text></Text>
                                        </View>
                                        <TouchableOpacity onPress={async () => {
                                            await Clipboard.setStringAsync(passUser?.ref_id).then(() => {
                                                Toast.show({
                                                    type: "success",
                                                    text1: "Success",
                                                    text2: "Referral ID copied!"
                                                })
                                            })
                                        }}>
                                            <MaterialIcons name="content-copy" size={20} color="grey" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        <Text style={styles.NameStyle}>Referrals:<Text style={{ color: "grey" }}> {passUser?.referral_count ? passUser?.referral_count : "None"}</Text></Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        {passUser?.pin ? (
                                            <Text style={styles.NameStyle}>PIN:<Text style={{ color: "#33cc33" }}> Active </Text></Text>
                                        ) : (
                                            <Text style={styles.NameStyle}>PIN:<Text style={{ color: "#ff3300" }}>  Inactive</Text></Text>
                                        )}
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        {passUser?.nin_verified ? (
                                            <Text style={styles.NameStyle}>NIN: <Text style={{ color: "#33cc33" }}>Verified </Text></Text>
                                        ) : (
                                            <Text style={styles.NameStyle}>NIN: <Text style={{ color: "#ff3300" }}> Not verified</Text></Text>
                                        )}
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View>
                                        {passUser?.bvn_verified ? (
                                            <Text style={styles.NameStyle}>BVN: <Text style={{ color: "#33cc33" }}>Verified </Text></Text>
                                        ) : (
                                            <Text style={styles.NameStyle}>BVN: <Text style={{ color: "#ff3300" }}> Not verified</Text></Text>
                                        )}
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#eee', marginTop: 5, marginBottom: 12 }} />
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text style={styles.NameStyle}>2FA:</Text>
                                        {twofaloading ? (
                                            <ActivityIndicator size={'small'} color={AppColor.Blue} />
                                        ) : (
                                            <Switch
                                                onValueChange={async () => {
                                                    settwofaLoading(true)
                                                    const userToken = await AsyncStorage.getItem('userToken')
                                                    fetch(`${BaseUrl}/user/2fa/toggle`, {
                                                        method: "POST",
                                                        headers: {
                                                            'passcoder-access-token': userToken,
                                                            'Accept': 'application/json',
                                                            'Content-Type': 'application/json',

                                                        }
                                                    }).then(async (res) => {
                                                        const response = await res.json();
                                                        settwofaLoading(false);
                                                        GetCurrentUser()
                                                    }).catch((err) => {
                                                        Toast.show({
                                                            type: "error",
                                                            text1: "Error",
                                                            text2: "Error occured - 101"
                                                        })
                                                    })

                                                }}
                                                trackColor={{ false:"grey", true:AppColor.Blue }}
                                                value={twofa}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </>
                }

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    whiteBoard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        marginTop: 10,
    },
    textStyle: {
        fontFamily: "lexendBold",
        fontSize: 15,
        flex: 1,
        marginLeft: 10,
        color: AppColor.Blue
    },
    lowerText: {
        fontFamily: "lexendMedium",
        fontSize: 10,
        color: "grey",
        marginLeft: 10,
    },
    userPoinandStar: {
        fontFamily: "lexendBold",
        fontSize: 18,
    },
    userLowerPoint: {
        fontFamily: 'lexendMedium',
        fontSize: 11.5,
        color: "grey"
    },
    ViewDetailModal: {
        flex: 1

    },
    NameStyle: {
        fontFamily: "lexendBold"
    },
    inputScreen: {
        backgroundColor: "#eee",
        height: 45,
        borderRadius: 8,
        paddingLeft: 20,
        fontFamily: "lexendBold"
    },
    inputLabel: {
        fontFamily: "lexendBold",
        marginBottom: 5
    },
    updateButton: {
        height: 45,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: AppColor.Blue,
        marginTop: 15
    }
})