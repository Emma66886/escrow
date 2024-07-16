import { Cell, toNano,address, beginCell } from '@ton/core';
import { 
    // KinemEscrow,
    NftCollection
 } from '../wrappers/KinemEscrow';
import { NetworkProvider } from '@ton/blueprint';
import {buildOnchainMetadata} from "./jetton-helper"

export async function run(provider: NetworkProvider) {
    // const kinemEscrow = provider.open(await KinemEscrow.fromInit(BigInt(Math.floor(Math.random() * 10000))));
    // console.log(provider.sender().address)
    // const jettonParam = {
    //     name:"ESCROW TON COIN",
    //     description:"This is Escrow contract",
    //     symbol:"SETCETT",
    //     image:"https://docs.ton.org/img/ton_logo_light_background.svg"
    // }
    // // const escrow_wallet = address("EQAh-bXOkx3BhNydwEoY0oIEtEg-2r7irCl5tLAE774NiEA5");
    // const content = buildOnchainMetadata(jettonParam)
    // SampleJetton.init()
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    const jettonSample = provider.open(await NftCollection.fromInit(provider.sender().address!
    ,newContent,{
        $$type:"RoyaltyParams",
        numerator: 350n, // 350n = 35%
        denominator: 1000n,
        destination: provider.sender().address!,
    }));

    // await kinemEscrow.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.15'),
    //     },
    //     {
    //         $$type: 'Deploy',
    //         queryId: 0n,
    //     }
    // );
    await jettonSample.send(
        provider.sender(),
        {
            value: toNano('1'),
        },
        {
            $$type:"Mint",
            amount:toNano(1),
            receiver:provider.sender().address!
        }
    );

    // await provider.waitForDeploy(kinemEscrow.address);
    // await jettonSample.send(provider.sender(),{value:toNano("0.1")},{$$type:"RevokeOwnerShip",new_owner:escrow_wallet})
    await provider.waitForDeploy(jettonSample.address);
    console.log("Deployed")
    // console.log('ID', await kinemEscrow.getId());
}

// Token
