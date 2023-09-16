import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Basic from './Screens/Auth/Basic';
import Otp from './Screens/Auth/Otp';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Screens/Pass/Home';
import { AppColor } from './utils/Color';
import { Entypo, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import ExtendedBio from './Screens/Pass/ExtendedBio';
import Notifications from './Screens/Pass/Notifications';
import Profile from './Screens/Pass/Profile';
import Settings from './Screens/Pass/Settings';
import Login from './Screens/Auth/Login';
import ForgotPassword from './Screens/Auth/ForgotPassword';
import SuccessForgotPassword from './Screens/Auth/SuccessForgotPassword';
import Register from './Screens/Auth/Register';
import Password from './Screens/Auth/Password';
import Emailcheck from './Screens/Auth/Email';
import Offers from './Screens/Pass/Offers';
import { Image, SafeAreaView } from 'react-native';
import Request from './Screens/Pass/Request';
import Pins from './Screens/Pass/Pins';
import WalletPins from './Screens/Pass/WalletPins';
import Help from './Screens/Pass/Help';
import Passwords from './Screens/Pass/Passwords';
import About from './Screens/Pass/About';
import Checkemail from './Screens/Pass/Checkemail';
import Createpin from './Screens/Pass/Createpin';
import Confirmpin from './Screens/Pass/Confirmpin';
import CreateWalletPin from './Screens/Pass/CreateWalletPin';
import ConfirmWalletPin from './Screens/Pass/ConfirmWalletPin';
import Updates from './Screens/Pass/Updates';
import Onboard from './Screens/Auth/Onboard';
import Browseapp from './Screens/Pass/Browseapp';
import ProofAddress from './Screens/Pass/ProofAddress';
import ProofAddressView from './Screens/Pass/ProofAddressView';
import ProofAddressEdit from './Screens/Pass/ProofAddressEdit';
import AddNin from './Screens/Pass/AddNin';
import EditNin from './Screens/Pass/EditNin';
import NinView from './Screens/Pass/NinView';
import UpdateName from './Screens/Pass/UpdateName';
import UpdateNumber from './Screens/Pass/UpdateNumber';
import UpdateDob from './Screens/Pass/UpdateDob';
import UpdateDetails from './Screens/Pass/UpdateDetails';
import AddBvn from './Screens/Pass/AddBvn';
import BvnView from './Screens/Pass/BvnView';
import EditBvn from './Screens/Pass/EditBvn';
import NextofKinAdd from './Screens/Pass/NextofKinAdd';
import NextofKinEdit from './Screens/Pass/NextofKinEdit';
import NextofKinView from './Screens/Pass/NextofKinView';
import Credentials from './Screens/Pass/Credential/Credentials';
import Primary from './Screens/Pass/Credential/Primary';
import PrimaryView from './Screens/Pass/Credential/PrimaryView';
import EditPrimary from './Screens/Pass/Credential/EditPrimary';
import SecondaryView from './Screens/Pass/Credential/SecondaryView';
import Secondary from './Screens/Pass/Credential/Secondary';
import SecondaryEdit from './Screens/Pass/Credential/SecondaryEdit';
import TertiaryView from './Screens/Pass/Credential/TertiaryView';
import TertiaryAdd from './Screens/Pass/Credential/TertiaryAdd';
import TertiaryEdit from './Screens/Pass/Credential/TertiaryEdit';
import AdditionalView from './Screens/Pass/Credential/AdditionalView';
import AdditionalAdd from './Screens/Pass/Credential/AdditionalAdd';
import AdditionalEdit from './Screens/Pass/Credential/AdditionalEdit';
import WorkView from './Screens/Pass/Credential/WorkView';
import WorkAdd from './Screens/Pass/Credential/WorkAdd';
import WorkEdit from './Screens/Pass/Credential/WorkEdit';
import Medicals from './Screens/Pass/Medical/Medicals';
import AddBasic from './Screens/Pass/Medical/addBasic';
import ViewMedical from './Screens/Pass/Medical/ViewMedical';
import EditMedical from './Screens/Pass/Medical/EditMedical';
import AddContact from './Screens/Pass/Medical/AddContact';
import ViewContact from './Screens/Pass/Medical/ViewContact';
import History from './Screens/Pass/Medical/History';
import ViewHistory from './Screens/Pass/Medical/ViewHistory';
import UploadProfile from './Screens/Pass/UploadProfile';
import GovernmentID from './Screens/Pass/Gov/GovernmentID';
import TaxRecords from './Screens/Pass/Gov/TaxRecords';
import AddTaxRecord from './Screens/Pass/Gov/AddTaxRecord';
import EditTaxRecord from './Screens/Pass/Gov/EditTaxRecord';
import BusinessCertificates from './Screens/Pass/Gov/BusinessCertificates';
import AddBusinessCertificate from './Screens/Pass/Gov/AddBusinessCertificate';
import EditBusinessCertificate from './Screens/Pass/Gov/EditBusinessCertificate';
import DriverLicence from './Screens/Pass/Gov/DriverLicence';
import AddDriverLicence from './Screens/Pass/Gov/AddDriverLicence';
import EditDriverLicence from './Screens/Pass/Gov/EditDriverLicence';
import VoterCard from './Screens/Pass/Gov/VoterCard';
import AddVoterCard from './Screens/Pass/Gov/AddVoterCard';
import EditVoterCard from './Screens/Pass/Gov/EditVoterCard';
import Passport from './Screens/Pass/Gov/Passport';
import AddPassport from './Screens/Pass/Gov/AddPassport';
import EditPassport from './Screens/Pass/Gov/EditPassport';
import SeePending from './Screens/Pass/SeePending';
import SeeOffer from './Screens/Pass/SeeOffer';
import SeeProfile from './Screens/Pass/SeeProfile';
import UpdatePin from './Screens/Pass/UpdatePin';
import SecondUpdatePin from './Screens/Pass/SecondUpdatePin';
import UpdateWalletPin from './Screens/Pass/UpdateWalletPin';
import SecondUpdateWalletPin from './Screens/Pass/SecondUpdateWalletPin';
import Wallet from './Screens/Pass/Wallet';
import DepositAmount from './Screens/Pass/DepositAmount';
import FundAmount from './Screens/Pass/FundAmount';
import ConfirmFunding from './Screens/Pass/ConfirmFunding';
import WithdrawalAmount from './Screens/Pass/WithdrawalAmount';
import ConfirmWithdrawal from './Screens/Pass/ConfirmWithdrawal';
import AuthorizeWithdrawal from './Screens/Pass/AuthorizeWithdrawal';
import PasscoderUserSend from './Screens/Pass/PasscoderUserSend';
import PasscoderUserSendDetails from './Screens/Pass/PasscoderUserSendDetails';
import AuthorizePasscoderUserPayment from './Screens/Pass/AuthorizePasscoderUserPayment';
import AuthorizePayment from './Screens/Pass/AuthorizePayment';
import PasscoderPartnerSend from './Screens/Pass/PasscoderPartnerSend';
import PasscoderPartnerSendDetails from './Screens/Pass/PasscoderPartnerSendDetails';
import AuthorizePasscoderPartnerPayment from './Screens/Pass/AuthorizePasscoderPartnerPayment';
import BankTransferSend from './Screens/Pass/BankTransferSend';
import BankTransferSendDetails from './Screens/Pass/BankTransferSendDetails';
import AuthorizeBankTransferPayment from './Screens/Pass/AuthorizeBankTransferPayment';
import BankAccount from './Screens/Pass/BankAccount';
import Transfer from './Screens/Pass/Transfer';

//create all the navigations
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

//signin stack
function Signstack() {

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Otp" component={Otp} />
            <Stack.Screen name="Basic" component={Basic} />
            <Stack.Screen name="Email" component={Emailcheck} />
            <Stack.Screen name="Password" component={Password} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="SuccessForgotPassword" component={SuccessForgotPassword} />
            <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
    );
}

function OnboardStack() {

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name='Onboard' component={Onboard} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Otp" component={Otp} />
            <Stack.Screen name="Basic" component={Basic} />
            <Stack.Screen name="Email" component={Emailcheck} />
            <Stack.Screen name="Password" component={Password} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="SuccessForgotPassword" component={SuccessForgotPassword} />
            <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
    );
}

//app tab bar
function AppTab() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { borderTopWidth: 0, paddingTop: 10, paddingBottom: 20, height: 70 }
        }}>

            <Tab.Screen name="Home" component={Home} options={{
                tabBarLabel: 'Home',
                tabBarInactiveTintColor: "grey",
                tabBarActiveTintColor: AppColor.Blue,
                tabBarLabelStyle: { fontFamily: "lexendBold" },
                tabBarIcon: ({ color, size, focused }) => (
                    <Octicons name="home" size={20.4} color={focused ? AppColor.Blue : "grey"} />
                ),
            }} />

            <Tab.Screen name="Offers" component={Offers} options={{
                tabBarLabel: 'Offers',
                tabBarInactiveTintColor: "grey",
                tabBarActiveTintColor: AppColor.Blue,
                tabBarLabelStyle: { fontFamily: "lexendBold" },
                tabBarIcon: ({ color, size, focused }) => (
                    <Image
                        style={{ width: 24, height: 24, tintColor: focused ? AppColor.Blue : "grey" }}
                        source={{ uri: "https://cdn0.iconfinder.com/data/icons/ecommerce-business/24/Artboard_10-256.png" }} />
                ),
            }} />

            <Tab.Screen name="Updates" component={Updates} options={{
                tabBarLabel: 'Updates',
                tabBarInactiveTintColor: "grey",
                tabBarActiveTintColor: AppColor.Blue,
                tabBarLabelStyle: { fontFamily: "lexendBold" },
                tabBarIcon: ({ color, size, focused }) => (
                    <Octicons name="megaphone" size={20.3} color={focused ? AppColor.Blue : "grey"} />
                ),
            }} />

            <Tab.Screen name="Browse" component={Browseapp} options={{
                tabBarLabel: 'Browse Apps',
                tabBarInactiveTintColor: "grey",
                tabBarActiveTintColor: AppColor.Blue,
                tabBarLabelStyle: { fontFamily: "lexendBold" },
                tabBarIcon: ({ color, size, focused }) => (
                    <Ionicons name="md-folder-open-outline" size={24} color={focused ? AppColor.Blue : "grey"} />
                ),
            }} />

            <Tab.Screen name="Request" component={Request} options={{
                tabBarLabel: 'Requests',
                tabBarInactiveTintColor: "grey",
                tabBarActiveTintColor: AppColor.Blue,
                tabBarLabelStyle: { fontFamily: "lexendBold" },
                tabBarIcon: ({ color, size, focused }) => (
                    <Image
                        style={{ width: 24, height: 24, tintColor: focused ? AppColor.Blue : "grey" }}
                        source={{ uri: "https://cdn1.iconfinder.com/data/icons/line-awesome-vol-6/32/user-lock-solid-256.png" }} />
                ),
            }} />
        </Tab.Navigator>
    );
}

//main app
function Mainapp() {
    return (
        // Commit message - Added SafeViewArea to the MainApp screens to fix bezelness issue on iOS.
        // <SafeAreaView style={{ flex:1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Tab' component={AppTab} />
                <Stack.Screen name='Profile' component={Profile} />
                <Stack.Screen name='GovernmentID' component={GovernmentID} />
                <Stack.Screen name='TaxRecords' component={TaxRecords} />
                <Stack.Screen name='AddTaxRecord' component={AddTaxRecord} />
                <Stack.Screen name='EditTaxRecord' component={EditTaxRecord} />
                <Stack.Screen name='BusinessCertificates' component={BusinessCertificates} />
                <Stack.Screen name='AddBusinessCertificate' component={AddBusinessCertificate} />
                <Stack.Screen name='EditBusinessCertificate' component={EditBusinessCertificate} />
                <Stack.Screen name='DriverLicence' component={DriverLicence} />
                <Stack.Screen name='AddDriverLicence' component={AddDriverLicence} />
                <Stack.Screen name='EditDriverLicence' component={EditDriverLicence} />
                <Stack.Screen name='VoterCard' component={VoterCard} />
                <Stack.Screen name='AddVoterCard' component={AddVoterCard} />
                <Stack.Screen name='EditVoterCard' component={EditVoterCard} />
                <Stack.Screen name='Passport' component={Passport} />
                <Stack.Screen name='AddPassport' component={AddPassport} />
                <Stack.Screen name='EditPassport' component={EditPassport} />
                <Stack.Screen name='UploadProfileImage' component={UploadProfile} />
                <Stack.Screen name='Credentials' component={Credentials} />
                <Stack.Screen name='Seepending' component={SeePending} />
                <Stack.Screen name='Seeoffers' component={SeeOffer} options={{
                    presentation: 'modal'
                }} />
                <Stack.Screen name='Secondary' component={Secondary} />
                <Stack.Screen name='SecondaryView' component={SecondaryView} />
                
                <Stack.Screen name='Basic' component={Basic} options={{
                    presentation: 'modal'
                }} />
                <Stack.Screen name='Updatepin' component={UpdatePin} />
                <Stack.Screen name='SecondUpdatePin' component={SecondUpdatePin} />
                <Stack.Screen name='UpdateWalletPin' component={UpdateWalletPin} />
                <Stack.Screen name='SecondUpdateWalletPin' component={SecondUpdateWalletPin} />
                <Stack.Screen name='Medical' component={Medicals} />
                <Stack.Screen name='Seeprofile' component={SeeProfile} />
                <Stack.Screen name='addBasic' component={AddBasic} />
                <Stack.Screen name='ViewBasic' component={ViewMedical} />
                <Stack.Screen name='EditBasic' component={EditMedical} />
                <Stack.Screen name='SecondaryEdit' component={SecondaryEdit} />
                <Stack.Screen name='TertiaryAdd' component={TertiaryAdd} />
                <Stack.Screen name='TertiaryView' component={TertiaryView} />
                <Stack.Screen name='TertiaryEdit' component={TertiaryEdit} />
                <Stack.Screen name='AdditionalAdd' component={AdditionalAdd} />
                <Stack.Screen name='AdditionalView' component={AdditionalView} />
                <Stack.Screen name='AdditionalEdit' component={AdditionalEdit} />
                <Stack.Screen name='WorkAdd' component={WorkAdd} />
                <Stack.Screen name='WorkView' component={WorkView} />
                <Stack.Screen name='WorkEdit' component={WorkEdit} />
                <Stack.Screen name='Settings' component={Settings} />
                <Stack.Screen name='AddContact' component={AddContact} />
                <Stack.Screen name='WorkHistory' component={History} />
                <Stack.Screen name='ViewHistory' component={ViewHistory} />
                <Stack.Screen name='ViewContact' component={ViewContact} />
                <Stack.Screen name='NextofKinAdd' component={NextofKinAdd} />
                <Stack.Screen name='NextofKinEdit' component={NextofKinEdit} />
                <Stack.Screen name='NextofKinView' component={NextofKinView} />
                <Stack.Screen name='AddNin' component={AddNin} />
                <Stack.Screen name='EditNin' component={EditNin} />
                <Stack.Screen name='NinView' component={NinView} />
                <Stack.Screen name='Primary' component={Primary} />
                <Stack.Screen name='PrimaryView' component={PrimaryView} />
                <Stack.Screen name='EditPrimary' component={EditPrimary} />
                <Stack.Screen name='AddBvn' component={AddBvn} />
                <Stack.Screen name='EditBvn' component={EditBvn} />
                <Stack.Screen name='BvnView' component={BvnView} />
                <Stack.Screen name='Updatesdetail' component={UpdateDetails} />
                <Stack.Screen name='Updatename' component={UpdateName} options={{ presentation: "modal" }} />
                <Stack.Screen name='Updatenumber' component={UpdateNumber} options={{ presentation: "modal" }} />
                <Stack.Screen name='Updatedob' component={UpdateDob} options={{ presentation: "modal" }} />
                <Stack.Screen name='ProofAddress' component={ProofAddress} />
                <Stack.Screen name='ProofAddressView' component={ProofAddressView} />
                <Stack.Screen name='ProofAddressEdit' component={ProofAddressEdit} />
                <Stack.Screen name='Notifications' component={Notifications} />
                <Stack.Screen name='ExtendedBio' component={ExtendedBio} />
                <Stack.Screen name='Check' component={Checkemail} />
                <Stack.Screen name='Createpin' component={Createpin} />
                <Stack.Screen name='Confirmpin' component={Confirmpin} />
                <Stack.Screen name='CreateWalletPin' component={CreateWalletPin} />
                <Stack.Screen name='ConfirmWalletPin' component={ConfirmWalletPin} />
                <Stack.Screen name='Pin' component={Pins} />
                <Stack.Screen name='WalletPin' component={WalletPins} />
                <Stack.Screen name='Wallet' component={Wallet} />
                <Stack.Screen name='DepositAmount' component={DepositAmount} options={{ presentation: "modal" }} />
                <Stack.Screen name='FundAmount' component={FundAmount} options={{ presentation: "modal" }} />
                <Stack.Screen name='ConfirmFunding' component={ConfirmFunding} options={{ presentation: "modal" }} />
                <Stack.Screen name='WithdrawalAmount' component={WithdrawalAmount} options={{ presentation: "modal" }} />
                <Stack.Screen name='ConfirmWithdrawal' component={ConfirmWithdrawal} options={{ presentation: "modal" }} />
                <Stack.Screen name='AuthorizeWithdrawal' component={AuthorizeWithdrawal} options={{ presentation: "modal" }} />
                <Stack.Screen name='PasscoderUserSend' component={PasscoderUserSend} options={{ presentation: "modal" }} />
                <Stack.Screen name='PasscoderBusinessSend' component={Transfer} options={{ presentation: "modal" }} />
                <Stack.Screen name='PasscoderUserSendDetails' component={PasscoderUserSendDetails} options={{ presentation: "modal" }} />
                <Stack.Screen name='AuthorizePasscoderUserPayment' component={AuthorizePasscoderUserPayment} />
                <Stack.Screen name='AuthorizePayment' component={AuthorizePayment} options={{ presentation: "modal" }} />
                <Stack.Screen name='PasscoderPartnerSend' component={PasscoderPartnerSend} options={{ presentation: "modal" }} />
                <Stack.Screen name='PasscoderPartnerSendDetails' component={PasscoderPartnerSendDetails} options={{ presentation: "modal" }} />
                <Stack.Screen name='AuthorizePasscoderPartnerPayment' component={AuthorizePasscoderPartnerPayment} />
                <Stack.Screen name='BankTransferSend' component={BankTransferSend} options={{ presentation: "modal" }} />
                <Stack.Screen name='BankTransferSendDetails' component={BankTransferSendDetails} options={{ presentation: "modal" }} />
                <Stack.Screen name='AuthorizeBankTransferPayment' component={AuthorizeBankTransferPayment} />
                <Stack.Screen name='BankAccount' component={BankAccount} />
                {/* <Stack.Screen name='Help' component={Help} /> */}
                {/* <Stack.Screen name='About' component={About} /> */}
                <Stack.Screen name='Password' component={Passwords} />
            </Stack.Navigator>
        // </SafeAreaView>
    )
}

export function Appwrapper({ isLoggedIn, onboarded }) {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false
            }}>
                {
                    onboarded ? 
                        <>
                            {
                                isLoggedIn ? 
                                    <>
                                        <Stack.Screen name='Passcoder' component={Mainapp} />
                                        <Stack.Screen name='Authentication' component={Signstack} />
                                    </> : 
                                    <>
                                        <Stack.Screen name='Authentication' component={Signstack} />
                                        <Stack.Screen name='Passcoder' component={Mainapp} />
                                    </>
                            }
                        </> : 
                        <>
                            <Stack.Screen name='Authentication' component={OnboardStack} />
                            <Stack.Screen name='Passcoder' component={Mainapp} />
                        </>
                }
            </Stack.Navigator>
        </NavigationContainer>
    )
}

