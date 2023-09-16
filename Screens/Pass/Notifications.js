import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Entypo, Feather, MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { TextInput } from 'react-native-gesture-handler';
import { AppColor } from '../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../utils/Url';
import Modal from "react-native-modal";
import Toast from 'react-native-toast-message';

export default function Notifications() {

    //nav props
    const nav = useNavigation();
    const [noti, setNoti] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true)

    const dropRef = useRef()

    const [notiLoading, setNotiLoading] = useState(false);
    const [activeID, setActiveID] = useState('');
    const [showText, setShowText] = useState(false);

    async function GetNotifications() {
        setNotiLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/notifications?size=50`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            setNotiLoading(false);
            const response = await res.json();
            if (response.success === true) {
                setNoti(response.data);
            } else {
                setShowText(true);
            }
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    useEffect(() => {
        GetNotifications()
    }, [])

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        GetNotifications().then(() => { setRefreshing(false) }).catch(() => setRefreshing(false));
    }, []);

    const [open, setOpened] = useState(false)
    const RenderNoti = ({ item }) => {

        return (
            <TouchableOpacity style={styles.notStyle} onPress={() => {
                setActiveID(item?.unique_id);
                setShowModal(true)
            }}>
                <View style={{ margin: 10, flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ padding: 10, backgroundColor: AppColor.LightGrey, height: 50, width: 50, borderRadius: 100, justifyContent: "center", alignItems: "center" }}>
                        <View>
                            {!item?.seen && <View style={{ backgroundColor: "red", height: 10, width: 10, borderRadius: 100, position: "absolute", }} />}
                            <Octicons name="bell" size={24} color={AppColor.Blue} />
                        </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.topText}>{item?.action}</Text>
                        <Text style={styles.partner}>{item?.type}</Text>
                        <Text style={styles.timeStyle}>{item?.updatedAt?.fulldate}</Text>
                    </View>
                    {open ? (
                        <Entypo name="chevron-down" size={24} color="grey" />
                    ) : (
                        <Entypo name="chevron-right" size={24} color="grey" />
                    )}
                </View>
            </TouchableOpacity>
        )
    }

    const RenderSeen = () => {
        const [fetched, setFetced] = useState({});

        async function GetNotification() {
            const userToken = await AsyncStorage.getItem('userToken')
            fetch(`${BaseUrl}/user/notification`, {
                method: "POST",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    unique_id: activeID
                })
            }).then(async (res) => {
                setLoading(false)
                const response = await res.json();
                setFetced(response.data)
            }).catch((err) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Error occured - 101"
                })
            })
        }

        useEffect(() => {
            GetNotification()
        }, [])
        return (
            <Modal style={{ margin: 0 }} isVisible={showModal} onBackButtonPress={() => setShowModal(false)} onBackdropPress={() => setShowModal(false)}>
                <View style={{ backgroundColor: "#fff", height: 'auto', width: Dimensions.get('screen').width, position: "absolute", bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <ActivityIndicator size={'large'} color={AppColor.Blue} />
                        </View>
                    ) : (
                        <View style={{}}>
                            <View style={{ height: 70, width: 70, borderRadius: 100, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 20 }}>
                                <MaterialCommunityIcons name="bell-ring" size={30} color="black" />
                            </View>
                            <View style={{ alignItems: "center", marginTop: 15 }}>
                                <Text style={{ fontFamily: 'lexendBold', fontSize: 17, marginBottom: 10 }}>{fetched?.type}</Text>
                                    <Text style={{ fontFamily: 'lexendLight', fontSize: 15, marginBottom: 10, marginLeft: 5, marginRight: 5 }}>{fetched?.action}</Text> 
                                {
                                    fetched?.details ? 
                                        <Text style={{ fontFamily: "lexendMedium", fontSize: 13, marginBottom: 10, margin: 5, textAlign:"center"}}>{fetched?.details}</Text> :
                                        ""
                                }
                                <Text style={{ fontFamily: 'lexendLight', fontSize: 12, color: "grey", marginBottom: 10 }}>{fetched?.updatedAt?.fulldate}</Text>
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: AppColor.Blue, height: 45, borderRadius: 8, justifyContent: "center", alignItems: "center", margin: 15 }}>
                                    <Text style={{ color: "#fff", fontFamily: "lexendBold" }}>Okay</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        )
    }

    return (
        <>
            <RenderSeen />
            <View style={styles.wrapper}>
                {/*Top Bar*/}
                <View style={{ margin: 15, marginTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                    <View>
                        <Text style={{ fontFamily: "lexendBold", fontSize: 18, textAlign: "center" }}>Notifications</Text>
                        <Text style={{ textAlign: "center", fontFamily: "lexendLight" }}>Passcoder notifications for you</Text>
                    </View>
                    <View />
                </View>


                {notiLoading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator color={AppColor.Blue} size={'large'} />
                    </View>
                ) : (
                    <View style={{ margin: 15 }}>
                        {(noti.length === 0 || showText) && <View style={{ justifyContent: "center", alignItems: "center", marginTop: 30 }}>
                            <Text style={{ fontFamily: "lexendBold" }}>No notifications!</Text>
                        </View>}
                        <FlatList
                            refreshing={refreshing}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 150 }}
                            data={noti}
                            keyExtractor={item => `${item.unique_id}`}
                            renderItem={({ item }) => <RenderNoti item={item} />}
                            style={{ marginTop: 3 }}
                        />
                    </View>
                )}
            </View>
        </>

    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    },
    actionBtn: {
        justifyContent: "center",
        alignItems: "center"
    },
    notStyle: {
        height: 'auto',
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10
    },
    topText: {
        fontFamily: "lexendBold",
        fontSize: 15
    },
    partner: {
        fontFamily: "lexendMedium",
        color: "grey"
    },
    timeStyle: {
        fontFamily: 'lexendMedium',
        fontSize: 12,
        color: "grey"
    }
})