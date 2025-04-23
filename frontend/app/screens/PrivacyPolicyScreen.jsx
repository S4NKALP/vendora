import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation()

    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"Privacy Policy"}
                suffix={<ChevronLeftIcon size={25} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 20
                }}
                prefixStyle={{
                    backgroundColor: "transparent"
                }}
                suffixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "black"
                }}
                containerStyle=""
                suffixAction={() => navigation.goBack()}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`mx-4 mt-2 `}>
                    <Text className={`text-primary font-semibold text-2xl mb-2`}>Cancelation Policy</Text>
                    <Text className={`text-`}>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ratione, non qui facilis minima iusto maxime. Architecto eos, culpa,
                        soluta minus quam quis quod accusantium nam quo nisi voluptatibus? Sunt enim error, illum voluptate mollitia, ipsum porro voluptas ullam earum, doloribus obcaecati.
                        Illum sapiente repellat dolor ex, modi eum aliquam sed corporis delectus architecto tempore itaque dolore exercitationem odio nemo voluptate praesentium aliquid
                        unde soluta eaque natus illo! Qui, aperiam saepe!</Text>
                    <Text className={`text-primary font-semibold text-2xl mt-2 mb-2`}> Terms and Condition</Text>
                    <Text><Text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore quibusdam perspiciatis nemo quis? Officia eius temporibus cumque rem aut optio inventore, 
                        fuga incidunt, deserunt, aperiam nihil quo nemo impedit reiciendis eaque facilis fugit. Consequuntur vero amet ratione illum expedita ipsum aperiam nam eveniet aut 
                        at illo earum temporibus, voluptatem facere adipisci iure hic cum ex labore dolore deleniti doloremque quibusdam? Dicta, itaque quisquam blanditiis eum praesentium 
                        ab deleniti cumque. Voluptate quam quis reiciendis dolor nesciunt culpa. Voluptatum temporibus aliquid quis, magni sapiente optio error quasi in quae et illo labore 
                        cumque minima quibusdam? Blanditiis optio alias distinctio similique consequatur inventore?</Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae 
                        veniam quam architecto repellat quia ullam distinctio corporis amet, pariatur est? Atque libero nisi, magni esse corporis neque unde! Quo ipsum inventore accusantium 
                        quas beatae animi nobis vel repellat, porro saepe debitis temporibus sunt corrupti reprehenderit doloribus molestiae odit perspiciatis eveniet dolore culpa unde distinctio 
                        pariatur? Mollitia blanditiis minima ex repellat beatae illo non doloribus. Voluptatum qui magnam quibusdam et architecto debitis officiis adipisci provident veritatis iste. 
                        Molestiae hic ea obcaecati nemo neque dolor sequi aliquid quos provident cumque facilis repellendus odit optio facere illo, eum blanditiis quo voluptatem necessitatibus nisi? 
                        Fugit repellat fugiat minima totam animi natus inventore asperiores perferendis numquam cumque, tenetur magnam, sequi eveniet sed laudantium et earum quidem beatae aliquam provident
                         nobis! Rerum distinctio aperiam soluta nam aliquid sit, maiores vel deleniti repudiandae. Provident dicta possimus dolorem! Debitis nisi, numquam deserunt sunt nesciunt facere aperiam 
                         optio earum assumenda commodi, repudiandae alias rerum quod magni quis, iure odio cupiditate impedit amet doloremque quas! Ipsum neque architecto vero, quidem mollitia ab omnis earum 
                         expedita officiis atque molestias quisquam ipsam aut eligendi harum, nostrum ullam provident, eius corporis reiciendis consequuntur corrupti nemo dolores optio. Delectus omnis voluptatem 
                         quasi expedita ea.</Text>
                </View>
            </ScrollView>

        </View>
    )
}