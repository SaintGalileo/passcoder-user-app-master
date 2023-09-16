import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Entypo, Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import Modal from "react-native-modal";
import { AppColor } from '../../../utils/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../../../utils/Url';
import Toast from 'react-native-toast-message';

export default function EditMedical({ route }) {

    const { height1, weight1, blood1, gen, unique } = route.params;

    const bloodData = [
        {
            title: 'A+'
        },
        {
            title: 'A-'
        },
        {
            title: 'B+'
        },
        {
            title: 'B-'
        },
        {
            title: 'AB+'
        },
        {
            title: 'AB-'
        },
        {
            title: 'O+'
        },
        {
            title: 'O-'
        }
    ];

    const GenoData = [
        {
            title: 'AA'
        },
        {
            title: 'AS'
        },
        {
            title: 'AC'
        },
        {
            title: 'CC'
        },
        {
            title: 'SC'
        },
        {
            title: 'SS'
        }
    ];

    const nav = useNavigation();
    const [height, setHeight] = useState(height1);
    const [weight, setWeight] = useState(weight1)
    const [blood, setBlood] = useState(blood1);
    const [geno, setGeno] = useState(gen)
    const [showBloodModal, setShowBloodModal] = useState(false);
    const [showGenoModal, setGenoModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const RenderBloodModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={showBloodModal} onBackButtonPress={() => setShowBloodModal(false)} onBackdropPress={() => setShowBloodModal(false)}>
                <View style={{ flex: 1 }}>
                    <View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
                        <Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setShowBloodModal(false)}>Cancel</Text>
                        <View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
                            {bloodData.map((item, index) => (
                                <TouchableOpacity onPress={() => {
                                    setBlood(item.title);
                                    setShowBloodModal(false)
                                }} style={{ marginBottom: 10 }} key={index}>
                                    <Text style={{ fontFamily: "lexendMedium", fontSize: 18, color: `${blood === item.title ? "blue" : ""}` }}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    const RenderGenoModal = () => {
        return (
            <Modal style={{ margin: 0 }} isVisible={showGenoModal} onBackButtonPress={() => setGenoModal(false)} onBackdropPress={() => setGenoModal(false)}>
                <View style={{ flex: 1 }}>
                    <View style={{ maxHeight: (Dimensions.get('screen').height * 70) / 100, width: Dimensions.get('screen').width, backgroundColor: "#fff", bottom: 0, position: "absolute" }}>
                        <Text style={{ margin: 15, fontFamily: "lexendMedium", color: "red" }} onPress={() => setGenoModal(false)}>Cancel</Text>
                        <View style={{ height: 5, width: Dimensions.get('screen').width, backgroundColor: "#eee" }} />
						<View style={{ margin: 15 }}>
                            {GenoData.map((item, index) => (
                                <TouchableOpacity onPress={() => {
                                    setGeno(item.title);
                                    setGenoModal(false)
                                }} style={{ marginBottom: 10 }} key={index}>
                                    <Text style={{ fontFamily: "lexendMedium", fontSize: 18, color: `${geno === item.title ? "blue" : ""}` }}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    async function EditData() {
        if (!height || height.length < 1) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Height is required"
            })
        } else if (!weight || weight.length < 1) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Weight is required"
            })
        } else if (!blood) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Select blood group"
            })
        } else if (!geno) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Select genotype"
            })
        } else {
            setLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            fetch(`${BaseUrl}/user/medical/details/edit`, {
                method: "PUT",
                headers: {
                    'passcoder-access-token': userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
    
                },
                body: JSON.stringify({
                    height: height,
                    weight: weight,
                    blood_group: blood,
                    genotype: geno,
                    unique_id: unique
                })
            }).then(async (res) => {
                const response = await res.json();
    
                    if (response.success === false) {
                        Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: res.status !== 422 ? response.message : response.data[0].msg
                        })
                        setLoading(false)
                    } else {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Medical Details Saved!"
                    })
                    setLoading(false);
                    nav.goBack();
                }
            }).catch((err) => {
                setLoading(false)
                nav.goBack()
            })
        }
    }

    return (

        <>
            <RenderGenoModal />
            <RenderBloodModal />
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                {/*Top bar*/}
                <View style={{ marginTop: 50, margin: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Feather name="arrow-left" size={24} color="black" onPress={() => nav.goBack()} />
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ fontFamily: "lexendBold", fontSize: 17 }}>Basic Details</Text>
                        <Text style={{ fontFamily: "lexendLight" }}>Edit medical details</Text>
                    </View>
                    <View />
                </View>


                <View style={{ margin: 15 }}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.toptext}>Enter your Height (cm)</Text>
                        <TextInput
                            value={height}
                            onChangeText={(txt) => setHeight(txt)}
                            keyboardType='number-pad'
                            style={styles.textInput}
                            placeholder='Your height in cm' />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.toptext}>Enter your Weight (kg)</Text>
                        <TextInput
                            value={weight}
                            onChangeText={(txt) => setWeight(txt)}
                            keyboardType='number-pad'
                            style={styles.textInput}
                            placeholder='Your weight in kg' />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Blood Group</Text>
                        <TouchableOpacity onPress={() => setShowBloodModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                            <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{blood}</Text>
                            <Entypo name="chevron-down" size={24} color="grey" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontFamily: "lexendMedium", marginBottom: 10 }}>Genotype</Text>
                        <TouchableOpacity onPress={() => setGenoModal(true)} style={{ flexDirection: "row", backgroundColor: "#eee", height: 50, alignItems: "center", justifyContent: "space-between", borderRadius: 8 }}>
                            <Text style={{ fontFamily: "lexendMedium", color: 'grey', paddingLeft: 20 }}>{geno}</Text>
                            <Entypo name="chevron-down" size={24} color="grey" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ backgroundColor: "#FFFFFF", height: 90, bottom: 0, position: "absolute", width: Dimensions.get('screen').width }}>
					<View style={{width: 300, flex: 1, alignSelf: "center", top: 20 }}>
                        <TouchableOpacity onPress={EditData} disabled={loading} style={{ backgroundColor: AppColor.Blue, borderRadius: 8, height: 50, width: 300, justifyContent: "center", alignItems: "center" }}>
                            {loading ? (
                                <ActivityIndicator size={'small'} color={'#fff'} />
                            ) : (
                                <Text style={{ fontFamily: "lexendBold", color: "#fff" }}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
				</View>
            </View>
        </>

    )
}

const styles = StyleSheet.create({
    toptext: {
        fontFamily: "lexendBold"
    },
    textInput: {
        backgroundColor: "#eee",
        height: 50,
        paddingLeft: 20,
        fontFamily: "lexendMedium",
        borderRadius: 8,
        marginTop: 10
    }
})