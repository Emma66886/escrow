import "@stdlib/deploy";
import "./tokens.tact";
import "./messages.tact";

contract Escrow with Deployable {
    const MinTonForStorage: Int = ton("0.01"); // enough for 1 KB of storage for 2.5 years
    owner: Address;
    jetton_address: Address;
    content: Cell;
    deployed_jettons: map<Int, Address>;
    all_deployed_jettons_count: Int = 1;
    jettons_received: map<Address, Int>;

    init(content: Cell, max_supply: Int) {
        self.owner = sender();
        self.content = content;
        let init: StateInit = initOf SampleJetton(myAddress(), content, max_supply);
        let jettonAddress: Address = contractAddress(init);
        send(SendParameters{
            to: jettonAddress,
            value: 0,              // pay for message, the deployment and give some TON for storage
            mode: SendRemainingValue,
            code: init.code,                // attaching the state init will cause the message to deploy
            data: init.data,
            body: "Owner: deposit".asComment()    // we must piggyback the deployment on another message
        });
        self.jetton_address = jettonAddress;
        self.deployed_jettons.set(self.all_deployed_jettons_count,jettonAddress);
        self.all_deployed_jettons_count += 1;
        self.jettons_received = emptyMap();
        // send(SendParameters{
        //     to: jettonAddress,
        //     value: 0, 
        //     mode: SendRemainingValue, 
        //     body: Mint{amount:ton("1000000000"), receiver: myAddress()}.toCell()
        // });

        // send(SendParameters{
        //     to: context().sender,
        //     value: 0, 
        //     mode: SendRemainingValue,
        // });
    }

    receive(){
        dump("Deposited ton");

    }

    receive(msg: TokenExcesses){
        dump("Deposited excess ton");
        
    }

    receive(msg: MakeDeposit){
        require(context().value > ton("0.5"),"Amount too low");
        let userinit: StateInit = initOf JettonDefaultWallet(self.jetton_address, myAddress());
        let userJettonWallet: Address = contractAddress(userinit);
        let amount_to_send: Int = context().value * 10;
        dump("Deposited excess ton");
        // send(SendParameters{
        //     to: self.jetton_address,
        //     value: ton("0.5"), 
        //     mode: SendIgnoreErrors, 
        //     body: Mint{amount:amount_to_send, receiver: context().sender}.toCell()
        // });
        send(SendParameters{
            to: userJettonWallet,
            value: 0,
            mode: SendRemainingValue,
            body: TokenTransfer{
                queryId: 0,
                amount: amount_to_send,
                destination: context().sender,
                response_destination: myAddress(),
                custom_payload: null,
                forward_ton_amount:ton("0.001"),
                forward_payload: emptySlice()
            }.toCell(),
            code: userinit.code,
            data: userinit.data
        });
    }


    receive(msg: ChangeProgramOwner){
       require(context().sender == self.owner,"You are not authorized to perform this action");
       self.owner = msg.newOwner;
    }

    receive(msg: MintMoreTokens){
       require(context().sender == self.owner,"You are not authorized to perform this action");
       send(SendParameters{
            to: self.jetton_address,
            value: ton("0.5"), 
            mode: SendIgnoreErrors, 
            body: Mint{amount:msg.amount, receiver: myAddress()}.toCell()
        });
    }
    receive("Deposit ton") {
        let amount: Int = context().value - self.MinTonForStorage;
        require(context().value > self.MinTonForStorage , "Amount too low");
        dump("Ton deposited");
        send(SendParameters{
            to: self.jetton_address,
            value: 0, 
            mode: SendRemainingValue, 
            body: Mint{amount:ton("1"), receiver: myAddress()}.toCell()
        });
    }

    // receive(msg: TransferJetton){
    //     require(msg.amount > 0, "Amount sent must be greater than 0");
    //    let init: StateInit = initOf JettonDefaultWallet(msg.jetton_address, myAddress());  
    //     let my_jetton_address: Address = contractAddress(init);
    //     send(TokenTransfer{

    //     });
    // }

    receive(msg: ChangeJetton){
        require(sender() == self.owner,"You are not allowed to change the mint jetton");
        self.jetton_address = msg.jettonAddress;
    }
    // this will withdraw a specific amount but leave 0.01 for storage rent costs
    receive(msg: Withdraw){
        require(sender() == self.owner,"Only owner can withdraw tokens from the contract");
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MinTonForStorage);
        require(amount > 0, "Insufficient balance");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: amount,
            mode: SendRemainingValue + SendIgnoreErrors
        });
    }

    receive(msg: DeployJetton){
        let init: StateInit = initOf SampleJetton(myAddress(), msg.content, msg.max_supply);
        let jettonAddress: Address = contractAddress(init);
        self.jetton_address = jettonAddress;
        self.deployed_jettons.set(self.all_deployed_jettons_count,jettonAddress);
        self.all_deployed_jettons_count += 1;
    }


    get fun balance(): String {
        return myBalance().toCoinsString();
    }

    get fun owner_address(): Address{
        return self.owner;
    }

    get fun current_jetton_address(): Address{
        return self.jetton_address;
    }

    get fun get_all_deployed_jettons_count(): Int{
        return self.all_deployed_jettons_count;
    }

    get fun get_all_deployed_jettons(): map<Int,Address>{
        return self.deployed_jettons;
    }
}
