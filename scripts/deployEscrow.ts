import { Cell, toNano, address, } from '@ton/core';
import {
    // KinemEscrow,
    Escrow
} from '../wrappers/KinemEscrow';
import { NetworkProvider } from '@ton/blueprint';
import {buildOnchainMetadata} from "./jetton-helper"

export async function run(provider: NetworkProvider) {
    const jettonParam = {
        name:"KINEM TOKEN",
        description:"This is a KINEM Token",
        symbol:"KNT",
        image:"https://docs.ton.org/img/ton_logo_light_background.svg "
        // image:"https://seeklogo.com/images/T/tether-usdt-logo-FA55C7F397-seeklogo.com.png"
    }
    const escrow_wallet = address("EQD7qbcVe2VgunsIdg4snMVQzQUCxKCm1Sxy4ptLyxyycDpl");
    const content = buildOnchainMetadata(jettonParam)
    const newOwner = address("0QAvsshKbf7KeIVmo7k_6GtDJJbZsUnZJxCzqso3t810Zdnx")
    // const escrow = provider.open(await Escrow.fromInit(content,toNano(100_000_000_000_000_000)));
    const escrow = provider.open(new Escrow(address("EQD7qbcVe2VgunsIdg4snMVQzQUCxKCm1Sxy4ptLyxyycDpl")))
    // await escrow.send(
    //     provider.sender(),
    //     {
    //         value: toNano('1'),
    //     },
    //     {
    //         $$type: 'Deploy',
    //         queryId: 0n
    //     }
    // );
    await escrow.send(
        provider.sender(),
        {
            value: toNano('0.6'),
        },
        {
            $$type: 'MintMoreTokens',
            amount: toNano(500_000),
            receiver: address("0QCc6I_UPe0mC61-9mzYPXqNb7H_yqEOOZOHYIVbmE3UmlBs")
        }
    );
    await escrow.send(
        provider.sender(),
        {
            value: toNano('1'),
        },
        {
            $$type: 'MakeDeposit',amount:toNano(1)

        }
    );
    // await escrow.send(provider.sender(),
    // { value: toNano("0.05") },
    // {$$type:"",amount:toNano("0.05")}
// )
    // await escrow.send(provider.sender(),
    //  { value: toNano("0.05") },
    //   { $$type: "ChangeOwner", newOwner })

    // await provider.waitForDeploy(kinemEscrow.address);
    await provider.waitForDeploy(escrow.address);
    console.log("Deployed")
    console.log('ID', await escrow.getBalance());
}

// Token EQBk7sHIRTICd41LKISz73qCw6pHXTgrjrs52afCSnHMTiBm
// Escrow EQBGTQhTAbbtBQunzZ0NIOZkuDWIuTURkfPIiMNN0qYHS3e3
