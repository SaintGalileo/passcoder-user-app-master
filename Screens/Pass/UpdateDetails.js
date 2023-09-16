import { ActivityIndicator, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather, MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { BaseUrl } from '../../utils/Url';
import { AppColor } from '../../utils/Color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const ImageURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlgw0IYP0pqQSviRzcWn-0rzuT4wUquMpX5PZVaZ5iLOZVMZU4yr09YhT-HLlK1fitFEs&usqp=CAU';

const HEADER_MAX_HEIGHT = 190;
const HEADER_MIN_hEIGHT = 80;
const PROFILE_IMAGE_MAX_hEIGHT = 85
const PROFILE_IMAGE_MIN_hEIGHT = 55

export default function UpdateDetails({ route }) {
    const { width } = useWindowDimensions();
    const { partnerID, UID } = route.params;

    const [loading, setLoading] = useState(false)

    const [fetchedData, setFetchedData] = useState({})

    const scrollY = new Animated.Value(0);

    const nav = useNavigation();

    //get all announcment
    async function GetAnnouncement() {
        setLoading(true);
        const userToken = await AsyncStorage.getItem('userToken')
        fetch(`${BaseUrl}/user/partner/announcement?unique_id=${UID}&partner_unique_id=${partnerID}`, {
            method: "POST",
            headers: {
                'passcoder-access-token': userToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(async (res) => {
            const response = await res.json();
            setFetchedData(response.data)
            setLoading(false);
        }).catch((err) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Error occured - 100"
            })
        })
    }

    //use effect to get announcement
    useEffect(() => {
        GetAnnouncement()
    }, [])

    const Header_Height = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_hEIGHT],
        extrapolate: "clamp"
    })

    const Image_Height = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT],
        outputRange: [PROFILE_IMAGE_MAX_hEIGHT, PROFILE_IMAGE_MIN_hEIGHT],
        extrapolate: "clamp"
    })

    const Image_MarginTop = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT],
        outputRange: [HEADER_MAX_HEIGHT - (PROFILE_IMAGE_MAX_hEIGHT / 2), HEADER_MAX_HEIGHT],
        extrapolate: "clamp"
    })

    const HeaderZindex = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT],
        outputRange: [0, 1],
        extrapolate: "clamp"
    })

    const HeaderTitleButtom = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT + 5 + PROFILE_IMAGE_MIN_hEIGHT, HEADER_MAX_HEIGHT - HEADER_MIN_hEIGHT + 5 + PROFILE_IMAGE_MIN_hEIGHT + 26],
        outputRange: [-20, -20, -20, 0],
        extrapolate: "extend"
    })

    return (
        <>
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={'large'} color={AppColor.Blue} />
                </View>
            ) : (
                <>
                    {fetchedData !== null ? (
                        <View style={styles.wrapper}>

                            {/*Our Header*/}
                            <View>
                                <TouchableOpacity onPress={() => nav.goBack()} style={{ position: "absolute", zIndex: 100, marginTop: 50, margin: 15, backgroundColor: "#fff", padding: 10, borderRadius: 100 }}>
                                    <Feather name="arrow-left" size={24} color="black" />
                                </TouchableOpacity>
                                <Animated.Image
                                    alt={'No cover photo'}
                                    source={{ uri: fetchedData?.partner_data?.cover }}
                                    style={[styles.innerView, { height: Header_Height, zIndex: HeaderZindex, alignItems: "center" }]} />
                            </View>

                            {/*Our Scroll View*/}
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                scrollEventThrottle={16}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                style={styles.scrollView}>

                                {/*User Profile Image*/}
                                <Animated.View style={{
                                    height: Image_Height,
                                    width: Image_Height,
                                    borderRadius: PROFILE_IMAGE_MAX_hEIGHT / 2,
                                    borderColor: "#fff",
                                    borderWidth: 3,
                                    marginTop: Image_MarginTop,
                                    marginLeft: 15
                                }}>
                                    <Image
                                        alt="Partner image"
                                        style={{ flex: 1, width: null, height: null, borderRadius: PROFILE_IMAGE_MAX_hEIGHT / 2, backgroundColor: "#eee" }}
                                        source={{ uri: fetchedData?.partner_data?.photo }} />
                                </Animated.View>


                                {/*User Name and verification Icon*/}
                                <View style={{ margin: 15 }}>
                                    <Text style={styles.pName}>{fetchedData?.announcement_data?.title}</Text>
                                    {
                                        fetchedData?.partner_data?.verified ?
                                            <MaterialIcons name="verified" size={30} color="green" style={{ position: 'absolute', top: -40, right: 5 }} /> :
                                            ""
                                    }
                                    <Text style={{ fontFamily: "lexendMedium", fontSize: 15, marginTop: 5, color: "grey" }}>{fetchedData?.partner_data?.name + ", " + fetchedData?.partner_data?.city}</Text>
                                    <Text style={{ fontFamily: "lexendMedium", fontSize: 13, marginTop: 5, color: "grey" }}>{fetchedData?.partner_data?.state + ", " + fetchedData?.partner_data?.country}</Text>
                                </View>

                                <View style={{ margin: 15 }}>
                                    <Text style={{ fontFamily: "lexendBold", fontSize: 18 }}>Description</Text>
                                    <RenderHtml
                                        contentWidth={width}
                                        source={{ html: fetchedData?.announcement_data?.description }}
                                    />

                                </View>

                                <View style={{ height: 100 }} />
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: "center" }}>
                            <ActivityIndicator size={'large'} color={AppColor.Blue} />
                        </View>
                    )}
                </>
            )}
        </>

    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff"
    },
    innerView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "lightskyblue",

    },
    scrollView: {
        flex: 1
    },
    pName: {
        fontFamily: "lexendBold",
        fontSize: 20
    }
})