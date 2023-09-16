import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { AntDesign, Entypo, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { AppColor } from '../../utils/Color';
import { Credentials } from '../../Data/Credentials';
import { useNavigation } from '@react-navigation/native';
import { BaseUrl } from '../../utils/Url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import Modal from "react-native-modal";
import Toast from 'react-native-toast-message';
import { return_first_letter_uppercase, default_profile_image, digit_filter, count_filter } from '../../utils/Validations';

export default function Home() {

    //currnet user
    const [passUser, setPassuser] = useState({});

    const [verfiLoading, setVerifLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [countWarnings, setCountWarnings] = useState(1);

    //nav props
    const nav = useNavigation();

    //show pid
    const [showPID, setShowPID] = useState(true);

    //check if user nin is verified
    const [ninVerified, setNinVerified] = useState(true);

    // Warning details
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningDetails, setWarningDetails] = useState({});

    //fetch current user profile
    async function getCurrentUser() {
        setLoading(true);
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
            if (res.status !== 200) {
                await AsyncStorage.removeItem('userToken');
                Toast.show({
                    type: "error",
                    text1: "Access",
                    text2: response.message
                });
                nav.replace('Authentication');
            } else {
                setPassuser({ ...response.data, balance: digit_filter(response.data.balance), points: count_filter(response.data.points)});
                setLoading(false);
                await AsyncStorage.setItem('userPID', response.data.pid);
                if (response.data.photo === default_profile_image) {
                    let altCountWarnings = countWarnings;
                    setCountWarnings(altCountWarnings += 1);
                    setWarningDetails({
                        type: "warning",
                        details: "Take selfie photo in profile"
                    });
                    if (countWarnings === 1 || (countWarnings % 10 === 0)) setShowWarningModal(true);
                } else if (!response.data.pin) {
                    let altCountWarnings = countWarnings;
                    setCountWarnings(altCountWarnings += 1);
                    setWarningDetails({
                        type: "warning",
                        details: "Setup PIN for easy login via PID"
                    });
                    if (countWarnings === 1 || (countWarnings % 10 === 0)) setShowWarningModal(true);
                } else if (!response.data.two_factor_authentication) {
                    let altCountWarnings = countWarnings;
                    setCountWarnings(altCountWarnings += 1);
                    setWarningDetails({
                        type: "warning",
                        details: "Enable 2FA for extra security"
                    });
                    if (countWarnings === 1 || (countWarnings % 10 === 0)) setShowWarningModal(true);
                } else {
                    setCountWarnings(0);
                }
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    //verify nin button
    async function VerifyNIN() {
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
            setVerifLoading(false);
            if (!response.success) {
                nav.navigate("AddNin");
            } else {
                setVerifLoading(false);
                nav.navigate('NinView');
            }
        }).catch((err) => {
            setVerifLoading(false);
        })
    };

    //verify bvn button
    async function VerifyBVN() {
        setVerifLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/bvn`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',

            }
        }).then(async (res) => {
            const response = await res.json();
            setVerifLoading(false);
            if (!response.success) {
                nav.navigate("AddBvn");
            } else {
                setVerifLoading(false);
                nav.navigate('BvnView');
            }
        }).catch((err) => {
            setVerifLoading(false);
        })
    };

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

    useEffect(() => {
        getCurrentUser();

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then(async (remoteMessage) => {
                if (remoteMessage) {
                    // console.log(
                    //   'Notification caused app to open from quit state:',
                    //   remoteMessage.notification,
                    // );
                }
            });

        // Assume a message-notification contains a "type" property in the data payload of the screen to open

        messaging().onNotificationOpenedApp(async (remoteMessage) => {
            // console.log(
            //   'Notification caused app to open from background state:',
            //   remoteMessage.notification,
            // );
            if (remoteMessage.data.type === "Notification") {
                nav.navigate('Notifications');
            } else if (remoteMessage.data.type === "Request") {
                nav.navigate('Request');
            } else if (remoteMessage.data.type === "Payment Request") {
                nav.navigate('Wallet');
            } else if (remoteMessage.data.type === "Announcement") {
                nav.navigate('Updates');
            } else {
                nav.navigate('Home');
            }
        });

        // Register background handler
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            // console.log('Message handled in the background!', remoteMessage);
        });
    }, [])

    const [refreshing, setRefreshing] = useState(false);

    const showWarningIconAndColour = (type) => {
        if (type === "warning") {
            return {
                color: "coral",
                icon: "information-outline"
            }
        } else if (type === "danger") {
            return {
                color: "red",
                icon: "information-variant"
            }
        } else if (type === "success") {
            return {
                color: "green",
                icon: "check"
            }
        } else {
            return {
                color: "black",
                icon: "bell-ring"
            }
        }
    };

    const ShowWarning = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={showWarningModal} onBackButtonPress={() => setShowWarningModal(false)} onBackdropPress={() => setShowWarningModal(false)}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <View style={{}}>
                        <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                            <MaterialCommunityIcons name={showWarningIconAndColour(warningDetails?.type).icon} size={30} color={showWarningIconAndColour(warningDetails?.type).color} />
                        </View>
                        <View style={{ alignItems: "center", marginTop: 15 }}>
                            <Text style={{ fontFamily: 'lexendBold', fontSize: 17, marginBottom: 10 }}>{return_first_letter_uppercase(warningDetails?.type || "")}</Text>
                            <Text style={{ fontFamily: 'lexendLight', fontSize: 15, marginBottom: 10 }}>{warningDetails?.details}</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => setShowWarningModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    };
    return (
        <>
            <ShowWarning />
            <View style={styles.wrapper}>

                {/*Top bar*/}
                <View style={styles.topBar}>
                    <Image source={require("../../assets/img/icon.png")} resizeMode='contain' style={{ height: 50, width: 50, tintColor: AppColor.Blue }} />
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons name="wallet-outline" size={24} color="black" style={{ marginRight: 15 }} onPress={() => {
                            nav.navigate("Wallet")
                        }} />
                        <Octicons name="bell" size={24} color="black" style={{ marginRight: 15 }} onPress={() => nav.navigate('Notifications')} />
                        <TouchableOpacity onPress={() => nav.navigate("Profile")}>
                            <Image style={{ width: 35, height: 35, borderWidth: 1, borderColor: AppColor.Blue, borderRadius: 100, backgroundColor: "#eee" }} source={{ uri: passUser?.photo }} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={getCurrentUser} />
                }>
                    {/*User id Card*/}
                    

                    <View style={styles.card}>
                        <Image source={require("../../assets/img/fing.png")} resizeMode='contain' style={{ margin: -20, height: 120, width: 120, bottom: -70, left: -140 }} />
                        <Image source={require("../../assets/img/fing.png")} resizeMode='contain' style={{ position: "absolute", right: -20, bottom: -35, margin: 10, height: 120, width: 120 }} />
                        {
                            loading ?
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 80 }}>
                                    <ActivityIndicator color={AppColor.White} size={'large'} />
                                </View> :
                                <View style={{ position: "absolute", margin: 20, alignItems: "center" }}>
                                    <View style={{ margin: 10, position: "absolute", width: (Dimensions.get('screen').width * 80 / 100), }}>

                                        {/*Top of data*/}
                                        {passUser?.nin_verified || passUser?.bvn_verified ? (
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -15 }}>
                                                <Text style={styles.nameStyle}>{passUser?.firstname}{" "}{passUser?.middlename ? passUser?.middlename + " " : ""}{passUser?.lastname}</Text>
                                                <TouchableOpacity onPress={() => setShowPID(!showPID)}>
                                                    <Ionicons name={showPID ? "eye-outline" : "eye-off-outline"} size={25} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        ) :
                                            null
                                        }

                                        {/*Star*/}
                                        {passUser?.nin_verified || passUser?.bvn_verified ? (
                                            <View>
                                                <View style={{ flexDirection: 'row', alignItems: "center", marginTop: 7 }}>
                                                    <View>
                                                        <Text style={{ fontFamily: "lexendMedium", color: "#fff", fontSize: 19 }}><Text style={{ fontFamily: 'lexendBold' }}>{"\u20A6"}</Text> {passUser?.balance}</Text>
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <TouchableOpacity style={{ backgroundColor: '#544fa5', height: 24, width: 60, justifyContent: "center", alignItems: "center", borderRadius: 5 }} onPress={() => { nav.navigate("Wallet") }}>
                                                            <Text style={{ fontFamily: 'lexendLight', color: "#fff" }}>Fund</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: "row", marginTop: 5 }}>
                                                    <RenderStar userstar={passUser?.star.toString()} />
                                                </View>
                                            </View>
                                        ) :
                                            null
                                        }

                                        {/*Middle view*/}
                                        {passUser?.nin_verified || passUser?.bvn_verified ? (
                                            <View style={{ marginTop: 10, bottom: -30 }}>
                                                <Text style={{ fontFamily: "lexendLight", color: "#fff" }}>PASSCODER ID</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    {showPID ? (
                                                        <Text style={styles.codeStyle}>XXXXXX</Text>
                                                    ) : (
                                                        <TouchableOpacity onPress={async () => {
                                                            await Clipboard.setStringAsync(passUser?.pid).then(() => {
                                                                Toast.show({
                                                                    type: "success",
                                                                    text1: "Success",
                                                                    text2: "PID copied!"
                                                                })
                                                            })
                                                        }}>
                                                            <Text style={styles.codeStyle}>{passUser?.pid}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                    {
                                                        !showPID ? 
                                                            <TouchableOpacity onPress={async () => {
                                                                await Clipboard.setStringAsync(passUser?.pid).then(() => {
                                                                    Toast.show({
                                                                        type: "success",
                                                                        text1: "Success",
                                                                        text2: "PID copied!"
                                                                    })
                                                                })
                                                            }}>
                                                                <MaterialCommunityIcons name="content-copy" size={15} color="#fff" />
                                                            </TouchableOpacity> :
                                                            null
                                                    }
                                                </View>
                                            </View>
                                        ):
                                            <View style={{ marginTop: 25 }}>
                                                <Text style={{ fontFamily: "lexendLight", color: "#fff" }}>PASSCODER ID</Text>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={styles.codeStyle}>XXXXXX</Text>
                                                </View>
                                            </View>
                                        }

                                        {!passUser?.nin_verified && !passUser?.bvn_verified ? <>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                <View style={{ marginBottom: 20, width: 120, marginLeft: -30, marginRight: 20 }}>
                                                    <TouchableOpacity style={styles.verifNIN} onPress={VerifyNIN}>
                                                        {verfiLoading ? (
                                                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                                                        ) : (
                                                            <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue }}>Verify NIN</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={{ marginBottom: 20, width: 120, marginRight: -30, marginLeft: 20 }}>
                                                    <TouchableOpacity style={styles.verifNIN} onPress={VerifyBVN}>
                                                        {verfiLoading ? (
                                                            <ActivityIndicator color={AppColor.Blue} size={'small'} />
                                                        ) : (
                                                            <Text style={{ fontFamily: "lexendBold", color: AppColor.Blue }}>Verify BVN</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </> :
                                            null
                                        }

                                        {/*point*/}
                                        {passUser?.nin_verified || passUser?.bvn_verified ? (
                                            <TouchableOpacity style={{ alignSelf: "flex-end", alignItems: "center", bottom: 25 }}>
                                                <Text style={{ fontFamily: "lexendBold", color: "#fff", fontSize: 20 }}>{passUser?.points}</Text>
                                                <Text style={{ color: "#fff", fontFamily: "lexendMedium" }}>point{passUser?.points === 1 ? "" : "s"}</Text>
                                            </TouchableOpacity>
                                        ) :
                                            null
                                        }
                                    </View>
                                </View>
                        }
                    </View>

                    {/* Alert to users that address hasn't been verified yet */}
                    {
                        passUser?.star < 2 ?
                            <View style={{ backgroundColor: "#ffcccc", borderRadius: 8, height: 'auto', width: Dimensions.get('screen').width - 30, alignSelf: 'center', padding: 10, flexDirection: "row", alignItems: "center" }}>
                                <View style={{ height: 40, width: 40, justifyContent: "center", alignItems: 'center', backgroundColor: "#fff", borderRadius: 100 }}>
                                    <Ionicons name="warning-outline" size={20} color="#ff3333" />
                                </View>
                                <View style={{ marginLeft: 20 }}>
                                    <Text style={{ fontFamily: "lexendBold", color: "#ff3333" }}>Awaiting address verification</Text>
                                </View>
                            </View> : null
                    }
                    
                    {/*Credentials*/}
                    <View style={{ margin: 15, marginTop: 20}}>
                        {
                            !passUser?.nin_verified && !passUser?.bvn_verified ? 
                                <>
                                    {
                                        Credentials.map((item, index) => (
                                            <TouchableOpacity disabled={!passUser?.nin_verified && !passUser?.bvn_verified} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#d9d9d9", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                                <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                                    <Image source={item.icon} style={{ height: 30, width: 30 }} />
                                                </View>

                                                <View style={{ flex: 1, marginLeft: 15 }}>
                                                    <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 16 }}>{item.title}</Text>
                                                    <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    }
                                </> : <>
                                    {
                                        passUser?.star < 2 ? 
                                            (
                                                Credentials.map((item, index) => (
                                                    item.screen === "ExtendedBio" ? 
                                                        <TouchableOpacity disabled={!passUser?.nin_verified && !passUser?.bvn_verified} onPress={() => {
                                                            nav.navigate(item.screen)
                                                        }} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                                            <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                                                <Image source={item.icon} style={{ height: 30, width: 30 }} />
                                                            </View>

                                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                                <Text style={{ fontFamily: "lexendBold", color: item.color, fontSize: 16 }}>{item.title}</Text>
                                                                <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                                                            </View>
                                                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                                                        </TouchableOpacity> : 
                                                        <TouchableOpacity disabled={!passUser?.nin_verified && !passUser?.bvn_verified} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#d9d9d9", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                                            <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                                                <Image source={item.icon} style={{ height: 30, width: 30 }} />
                                                            </View>

                                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                                <Text style={{ fontFamily: "lexendBold", color: "grey", fontSize: 16 }}>{item.title}</Text>
                                                                <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                ))
                                            ) : (
                                                Credentials.map((item, index) => (
                                                    <TouchableOpacity disabled={!passUser?.nin_verified && !passUser?.bvn_verified} onPress={() => {
                                                        nav.navigate(item.screen)
                                                    }} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                                        <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                                            <Image source={item.icon} style={{ height: 30, width: 30 }} />
                                                        </View>

                                                        <View style={{ flex: 1, marginLeft: 15 }}>
                                                            <Text style={{ fontFamily: "lexendBold", color: item.color, fontSize: 16 }}>{item.title}</Text>
                                                            <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                                                        </View>
                                                        <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                                                    </TouchableOpacity>
                                                ))
                                            )
                                    }
                                    {/* {Credentials.map((item, index) => (
                                        <TouchableOpacity disabled={!passUser?.nin_verified && !passUser?.bvn_verified} onPress={() => {
                                            nav.navigate(item.screen)
                                        }} key={index} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 20, marginBottom: 20, borderRadius: 8, alignItems: "center" }}>
                                            <View style={{ backgroundColor: "#eee", padding: 10, borderRadius: 100 }}>
                                                <Image source={item.icon} style={{ height: 30, width: 30 }} />
                                            </View>

                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                <Text style={{ fontFamily: "lexendBold", color: item.color, fontSize: 16 }}>{item.title}</Text>
                                                <Text style={{ color: "#7A7B7C", fontFamily: "lexendLight" }}>{item.desc}</Text>
                                            </View>
                                            <Entypo name="chevron-right" size={24} color="#7A7B7C" />
                                        </TouchableOpacity>
                                    ))} */}
                                </>
                        }
                    </View>

                </ScrollView >

                <View style={{ position: "absolute", bottom: 0, right: 0, margin: 10 }}>
                    <TouchableOpacity style={styles.floatBtn} onPress={() => {
                        Linking.openURL('mailto:support@passcoder.io')
                    }}>
                        <Image style={{ height: 35, width: 35 }} resizeMode='contain' source={require('../../assets/chat.png')} />
                    </TouchableOpacity>
                </View>
            </View >
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: AppColor.LightGrey
    },
    topBar: {
        margin: 15,
        marginTop: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    card: {
        width: Dimensions.get('screen').width - 30,
        height: 220,
        backgroundColor: AppColor.Blue,
        margin: 15,
        borderRadius: 8,
        alignSelf: "center",
        alignItems: "center"
    },
    nameStyle: {
        fontFamily: "lexendBold",
        color: "#fff",
        fontSize: 20, 
        flexWrap: 'wrap', 
        width: 270
    },
    codeStyle: {
        fontFamily: 'lexendBold',
        fontSize: 25,
        color: "#fff",
        marginRight: 10
    },
    floatBtn: {
        height: 60,
        width: 60,
        backgroundColor: "#FF4500",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center"
    },
    verifNIN: {
        height: 50,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        borderRadius: 8
    }
})