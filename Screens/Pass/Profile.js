import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Entypo, Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppColor } from '../../utils/Color';
import Modal from "react-native-modal";
import auth from '@react-native-firebase/auth';
import { BaseUrl } from '../../utils/Url';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { passcoder_icon, count_filter } from "../../utils/Validations";

export default function Profile() {

    //render stars
    const RenderStar = ({ userstar }) => {
        if (userstar === "1") {
            return (
                <AntDesign name="star" size={20} color="#FFCB46" />
            )
        } else if (userstar === "2") {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                </View>
            )
        } else if (userstar === "3") {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                </View>
            )
        } else if (userstar === "4") {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                </View>
            )
        } else if (userstar === "5") {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                    <AntDesign name="star" size={20} color="#FFCB46" />
                </View>
            )
        } else {
            return (
                <View style={{ flexDirection: 'row' }}>

                </View>
            )
        }
    }

    //nav props
    const nav = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [passUser, setPassuser] = useState({});
    const [logoutLoading, setLogoutLoading] = useState(false)

    const [picModal, setPicModal] = useState(false);

    const [askProfileModal, setProfileModal] = useState(false);

    //show them the modal
    const [showDetailmodal, setShowdetailmodal] = useState(false);

    //function to get current user from back end
    async function GetCurrentUser() {
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
            setPassuser({ ...response.data, points: count_filter(response.data.points) });
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occured!"
            });
        })
    }

    useEffect(() => {
        GetCurrentUser()
    }, [])

    //ask user profile image or uploas new one!
    const AskProfile = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={askProfileModal} onBackdropPress={() => setProfileModal(false)} onBackButtonPress={() => setProfileModal(false)}>
                <View style={{ flex: 1 }}>
                    <View style={{ position: "absolute", bottom: 0, width: Dimensions.get('screen').width, height: 100, backgroundColor: "#fff" }}>
                        <View style={{ margin: 15 }}>
                            <TouchableOpacity style={{ marginBottom: 20 }} onPress={() => {
                                setProfileModal(false);
                                setPicModal(true)
                            }}>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18 }}>View Profile Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginBottom: 20 }} onPress={() => {
                                setProfileModal(false);
                                nav.navigate('UploadProfileImage', { img: passUser.photo, id: passUser.pid })
                            }}>
                                <Text style={{ fontFamily: "lexendBold", fontSize: 18 }}>Upload Profile Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    //profile refresh
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetCurrentUser().then(() => setRefreshing(false)).catch(() => setRefreshing(false))
    }, []);

    const ShowImage = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={picModal} onBackButtonPress={() => setPicModal(false)} onBackdropPress={() => setPicModal(false)}>
                <View style={{ justifyContent: "center" }}>
                    {/* <Image source={{ uri: passUser?.photo }} blurRadius={30} style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }} /> */}
                    <Image source={{ uri: passUser?.photo }} style={{ height: (Dimensions.get('screen').height * 50) / 100, width: Dimensions.get('screen').width, position: "absolute", alignSelf: "center" }} />
                </View>
            </Modal>
        )
    }

    return (
        <>
            <ShowImage />
            <AskProfile />
            <View style={styles.wrapper}>
                <View style={{ flex: 1, marginBottom: 10 }}>

                    {/*Top Bar*/}
                    <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                        <View>
                            <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Profile</Text>
                            <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>View your profile details</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                {
                                    text: "Cancel"
                                }, {
                                    text: "Yes",
                                    onPress: async () => {
                                        setLogoutLoading(true)
                                        if (auth().currentUser) {
                                            auth().signOut().then(async (res) => {
                                                const userToken = await AsyncStorage.getItem('userToken')
                                                fetch(`${BaseUrl}/auth/user/signout`, {
                                                    method: "POST",
                                                    headers: {
                                                        'passcoder-access-token': userToken,
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json',

                                                    }
                                                }).then(async (res) => {
                                                    setLogoutLoading(false);
                                                    await AsyncStorage.removeItem('userToken');
                                                    nav.replace('Authentication');
                                                }).catch((err) => {
                                                    Toast.show({
                                                        type: "error",
                                                        text1: "Error",
                                                        text2: "Error occured - 101"
                                                    })
                                                })
                                            })
                                        } else {
                                            const userToken = await AsyncStorage.getItem('userToken')
                                            fetch(`${BaseUrl}/auth/user/signout`, {
                                                method: "POST",
                                                headers: {
                                                    'passcoder-access-token': userToken,
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json',

                                                }
                                            }).then(async (res) => {
                                                setLogoutLoading(false);
                                                await AsyncStorage.removeItem('userToken');
                                                nav.replace('Authentication');
                                            }).catch((err) => {
                                                console.log(err)
                                                Toast.show({
                                                    type: "error",
                                                    text1: "Error",
                                                    text2: "Error occured - 101"
                                                })
                                            })
                                        }
                                    }
                                }
                            ])
                        }}>
                            {logoutLoading ? (
                                <ActivityIndicator color={AppColor.Blue} size={'small'} />
                            ) : (
                                <Ionicons name="power-sharp" size={24} color="red" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {/*Profile now*/}
                        <View style={{ marginTop: 0, alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setProfileModal(true)}>
                                <Image
                                    style={{ height: 100, width: 100, alignSelf: "center", borderWidth: 1, borderColor: AppColor.Blue, borderRadius: 100, backgroundColor: '#eee' }}
                                    source={{ uri: passUser?.photo || passcoder_icon }}
                                />
                            </TouchableOpacity>

                            <Text style={{ fontFamily: "lexendBold", textAlign: "center", marginTop: 5, fontSize: 16 }}>
                                <Text>{passUser?.firstname}</Text>{" "}
                                {
                                    passUser?.middlename ? 
                                        <Text>{passUser?.middlename}{" "}</Text> : 
                                        ""
                                }
                                <Text>{passUser?.lastname}</Text>
                            </Text>

                            <Text onPress={async () => {
                                await Clipboard.setStringAsync(passUser?.pid).then(() => {
                                    Toast.show({
                                        type: "success",
                                        text1: "Success",
                                        text2: "PID Copied!"
                                    })
                                })
                            }} style={{ fontFamily: "lexendMedium", textAlign: "center", marginTop: 1, fontSize: 18 }}>
                                PID: {passUser?.pid}
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <RenderStar userstar={passUser?.star?.toString()} />
                            </View>
                        </View>

                        {/*Divider*/}
                        <View style={{ borderWidth: 1, borderColor: "#eee", marginTop: 7, margin: 5 }} />

                        {/*point and star*/}
                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", marginTop: 10 }}>
                            <View style={{ alignItems: "center" }}>
                                <Text style={styles.userPointandStar}>{passUser?.points}</Text>
                                <Text style={styles.userLowerPoint}>Point{passUser?.points === 1 ? "" : "s"}</Text>
                            </View>
                            <View style={{ alignItems: "center" }}>
                                <Text style={styles.userPointandStar}>{passUser?.star}</Text>
                                <Text style={styles.userLowerPoint}>Star{passUser?.star === 1 ? "" : "s"}</Text>
                            </View>
                        </View>

                        {/*Lower profile*/}
                        <View style={{ flex: 1, marginTop: -20 }}>
                            <View style={{ margin: 15 }}>
                                <View style={styles.whiteBoard}>
                                    <View style={{ margin: 10 }}>

                                        {/*Referal link*/}
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fcfcfe", padding: 10, borderRadius: 8, margin: 5 }}>
                                            <View>
                                                <Text style={{ fontFamily: "lexendBold", fontSize: 18, color: AppColor.Blue }}>Referral Link</Text>
                                                <Text style={{ fontFamily: "lexendLight", color: "#938fd6" }}>{passUser?.referral_link}</Text>
                                            </View>
                                            <TouchableOpacity onPress={async () => {
                                                await Clipboard.setStringAsync(passUser?.referral_link).then(() => {
                                                    Toast.show({
                                                        type: "success",
                                                        text1: "Success",
                                                        text2: "Referral link copied!"
                                                    })
                                                })
                                            }}>
                                                <MaterialIcons name="content-copy" size={20} color="grey" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ marginTop: 10 }}>
                                            <TouchableOpacity onPress={() => {
                                                nav.navigate("Seeprofile")
                                            }} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                                <Image
                                                    resizeMode='contain'
                                                    style={{ width: 25, height: 25, tintColor: "#817dcf" }}
                                                    source={{ uri: "https://cdn1.iconfinder.com/data/icons/line-awesome-vol-6/32/user-edit-solid-256.png" }}
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Basic Details</Text>
                                                    <Text style={styles.lowerText}>Name, Contact details, 2FA etc</Text>
                                                </View>

                                                <View>
                                                    <Ionicons name="ios-chevron-forward" size={20} color="grey" />
                                                </View>
                                            </TouchableOpacity>


                                            <TouchableOpacity onPress={() => nav.navigate("Settings")} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                                <Feather name="shield" size={24} color="#817dcf" />

                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Security</Text>
                                                    <Text style={styles.lowerText}>Change security details</Text>
                                                </View>

                                                <View>
                                                    <Ionicons name="ios-chevron-forward" size={24} color="grey" />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => nav.navigate("BankAccount")} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                                <Ionicons name="wallet-outline" size={24} color="#817dcf" />

                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Bank Account</Text>
                                                    <Text style={styles.lowerText}>Add or edit bank details</Text>
                                                </View>

                                                <View>
                                                    <Ionicons name="ios-chevron-forward" size={24} color="grey" />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => {
                                                Linking.openURL('https://passcoder.io/privacy');
                                            }} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                                <MaterialCommunityIcons name="information-outline" size={24} color="#817dcf" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>About us</Text>
                                                    <Text style={styles.lowerText}>Read about what we do</Text>
                                                </View>

                                                <View>
                                                    <Ionicons name="ios-chevron-forward" size={24} color="grey" />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => {
                                                Linking.openURL('https://passcoder.io/terms');
                                            }} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                                <Ionicons name="ios-document-text-outline" size={24} color="#817dcf" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.textStyle}>Terms and conditions</Text>
                                                    <Text style={styles.lowerText}>View Terms and Conditions</Text>
                                                </View>

                                                <View>
                                                    <Ionicons name="ios-chevron-forward" size={24} color="grey" />
                                                </View>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>


                                <View>

                                    {/*lower profile*/}
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={{ fontFamily: "lexendBold", marginTop: 20, position: 'absolute', color: "grey" }}>Powered by</Text>
                                        <Image resizeMode='contain' style={{ height: 120, width: 120 }} source={require('../../assets/img/idp.png')} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                </View>
            </View>
        </>

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
    userPointandStar: {
        fontFamily: "lexendBold",
        fontSize: 18,
    },
    userLowerPoint: {
        fontFamily: 'lexendMedium',
        fontSize: 11.5,
        color: "grey"
    },
    ViewDetailModal: {
        width: Dimensions.get('screen').width,
        height: 650,
        backgroundColor: "#e6e6e6",
        position: "absolute",
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
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