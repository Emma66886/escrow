import { Cell, toNano,address } from '@ton/core';
import { 
    // KinemEscrow,
    SampleJetton
 } from '../wrappers/KinemEscrow';
import { NetworkProvider } from '@ton/blueprint';
import {buildOnchainMetadata} from "./jetton-helper"

export async function run(provider: NetworkProvider) {
    // const kinemEscrow = provider.open(await KinemEscrow.fromInit(BigInt(Math.floor(Math.random() * 10000))));
    // console.log(provider.sender().address)
    const jettonParam = {
        name:"ESCROW TON COIN",
        description:"This is Escrow contract",
        symbol:"SETCETT",
        image:"https://docs.ton.org/img/ton_logo_light_background.svg"
    }
    // const escrow_wallet = address("EQAh-bXOkx3BhNydwEoY0oIEtEg-2r7irCl5tLAE774NiEA5");
    const content = buildOnchainMetadata(jettonParam)
    // SampleJetton.init()
    const jettonSample = provider.open(await SampleJetton.fromInit(provider.sender().address!,content,toNano(1000_000_000)));

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
            $$type:"MakeDeposit",
            amount:toNano("10")
        }
    );

    // await provider.waitForDeploy(kinemEscrow.address);
    // await jettonSample.send(provider.sender(),{value:toNano("0.1")},{$$type:"RevokeOwnerShip",new_owner:escrow_wallet})
    await provider.waitForDeploy(jettonSample.address);
    console.log("Deployed")
    // console.log('ID', await kinemEscrow.getId());
}

// Token
