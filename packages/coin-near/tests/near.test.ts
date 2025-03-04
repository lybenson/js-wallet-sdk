import {
    AccessKey,
    addKey,
    createAccount,
    createTransaction,
    deleteAccount,
    deleteKey,
    deployContract,
    fullAccessKey,
    functionCall,
    functionCallAccessKey,
    getAddress,
    NearTypes,
    NearWallet,
    publicKeyFromSeed,
    SCHEMA,
    signTransaction,
    stake,
    transfer,
    validateAddress,
} from '../src';
import {base, BN, signUtil} from '@okxweb3/crypto-lib';
import {SignTxParams} from "@okxweb3/coin-base";
import {serialize} from "borsh";
import {PublicKey} from "../src/keypair";
import {MessagePayload} from "../src/nearlib";
import {base58} from "@scure/base";

/*
// send tx
curl -X POST -d '{ "jsonrpc": "2.0", "id": "1", "method": "broadcast_tx_commit", "params": ["DwAAAHpoYW5nb2sudGVzdG5ldACf6rjt8O6+BK7k723hWb3a5AHS15+W7v9r14mgyDyhnQMTt1wPVgAAEgAAAHpoYW5ncWlvazMudGVzdG5ldMrT3+w+qj+2i9kCh1uOhqdpcM93vcaH0vIbNeiqxFl1AgAAAAAFANsvZOZ5puXw20LF3bpZEeI0MzXozU8Bx0isPfDpdNItAAAAAAAAAAABAK629ZISVCE2Uu/GFBZKy1xV1Fcfcyoj8fDV7yoVu8kwf/DCRBDFY1/T0CTUT9qWAfOnWde2uH8t1RQxMTw1AQE="]}' -H "Content-Type: application/json" https://rpc.testnet.near.org

// tx status
curl -X POST -d '{ "jsonrpc": "2.0", "id": "1", "method": "tx", "params": ["7B4zWAth9JWNA3SiczxCo5pjmpuroKLyntNLLdJrDbSH","zhangqiok.testnet"]}' -H "Content-Type: application/json" https://rpc.testnet.near.org

// query access key
curl -X POST -d '{ "jsonrpc": "2.0", "id": "1", "method": "query", "params": {"request_type": "view_access_key", "finality": "final", "account_id": "zhangok.testnet", "public_key": "ed25519:BmFQzNmj172sQ44jWnaJSSiMFUNgypCyeyheEE8gYbwr"}}' -H "Content-Type: application/json" https://rpc.testnet.near.org
*/

describe("near", () => {

    test("signCommonMsg", async () => {
        let wallet = new NearWallet();
        let sig = await wallet.signCommonMsg({privateKey:"ebc42dae1245fad403bd18f59f7283dc18724d2fc843b61e01224b9789057347", message:{walletId:"123456789"}});
        expect(sig).toEqual("9cd25548cbd7af813b239a0aa0be329a3d1b053d6b84a63d1d7027d5459e864871b6eb259e9f74c752371f0348804be86e01ab26760a77eb071a7c9945e9b00a")

        sig = await wallet.signCommonMsg({privateKey:"ed25519:4ZBavqnpvLM5m96gvuSK5iGTFSo253TDzdcuiVUdyDY7njHADF5tv5LNHyfFnJiSNt7wthdxGjYNFL89vDAtqkmh", message:{walletId:"7FC4E090-2B10-4F0C-94B0-AC7014B8CCC5"}});
        expect(sig).toEqual("4ab8ba7079680447aaa2e44dc2a4c60bf35bfe4f1417db8e18d51fd9287a67be6b9f5134024dced167f36deeb4f957109dbe9c740f6881d1e3d18eb6f0f80f0c")

        sig = await wallet.signCommonMsg({privateKey:"ed25519:4ZBavqnpvLM5m96gvuSK5iGTFSo253TDzdcuiVUdyDY7njHADF5tv5LNHyfFnJiSNt7wthdxGjYNFL89vDAtqkmh", message:{text:"7FC4E090-2B10-4F0C-94B0-AC7014B8CCC5"}});
        expect(sig).toEqual("e35d274f5be9dd222a5b0a3896db128bff02e7c8576deefe71a40af099abd531df68e081c639dcbec206fdf9ddb2942fec2049bb6ec3c80253d0a4231aa6560c")
    });

    test("getRandomPrivateKey", async () => {
        let wallet = new NearWallet()
        let privateKey = await wallet.getRandomPrivateKey();
        let addr = await wallet.getNewAddress({privateKey: privateKey})
        let p = Uint8Array.from(Array.from(Array(32).keys()))
        let addr2 = await wallet.getNewAddress({privateKey: 'ed25519:1thX6LZfHDZZKUs92febYZhYRcXddmzfzF2NvTkPNE'})
        expect(addr2.address).toEqual("03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8")
    })


    test("getNewAddress common2", async () => {
        //sei137augvuewy625ns8a2age4sztl09hs7pk0ulte
        const privateKey = "ebc42dae1245fad403bd18f59f7283dc18724d2fc843b61e01224b9789057347"
        const wallet = new NearWallet();
        let expectedAddress = "002a77b478bf1ed25a6e00d5a458c800541313c3d8502c5d7f8249f912f55f84";
        expect((await wallet.getNewAddress({privateKey:privateKey})).address).toEqual(expectedAddress);
        expect((await wallet.getNewAddress({privateKey:'0x'+privateKey})).address).toEqual(expectedAddress)
        expect((await wallet.getNewAddress({privateKey:'0X'+privateKey})).address).toEqual(expectedAddress)
        expect((await wallet.getNewAddress({privateKey:'0X'+privateKey.toUpperCase()})).address).toEqual(expectedAddress)

        let p = Uint8Array.from(Array.from(Array(32).keys()))
        const res2 = await wallet.getNewAddress({privateKey: 'ed25519:' + base58.encode(p)});
        expect(res2.address!='').toEqual(true);
    });

    const ps: any[] = [];
    ps.push("");
    ps.push("0x");
    ps.push("124699");
    ps.push("1dfi付");
    ps.push("9000 12");
    ps.push("548yT115QRHH7Mpchg9JJ8YPX9RTKuan=548yT115QRHH7Mpchg9JJ8YPX9RTKuan ");
    ps.push("L1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYArL1vSc9DuBDeVkbiS79mJ441FNAYAr");
    ps.push("L1v");
    ps.push("0x31342f041c5b54358074b4579231c8a300be65e687dff020bc7779598b428 97a");
    ps.push("0x31342f041c5b54358074b457。、。9231c8a300be65e687dff020bc7779598b428 97a");
    ps.push("0x31342f041c5b54358074b457。、。9231c8a300be65e687dff020bc7779598b428 97a");
    ps.push("0000000000000000000000000000000000000000000000000000000000000000");
    test("edge test", async () => {
        const wallet = new NearWallet();
        let j = 1;
        for (let i = 0; i < ps.length; i++) {
            try {
                await wallet.getNewAddress({privateKey: ps[i]});
            } catch (e) {
                j = j + 1
                expect((await wallet.validPrivateKey({privateKey:ps[i]})).isValid).toEqual(false);
            }
        }
        expect(j).toEqual(ps.length + 1);
    });
    test("validPrivateKey2", async () => {
        const wallet = new NearWallet();
        const privateKey = await wallet.getRandomPrivateKey();
        let res = await wallet.validPrivateKey({privateKey: privateKey});
        expect(res.isValid).toEqual(true);

        res = await wallet.validPrivateKey({privateKey: "12"});
        expect(res.isValid).toEqual(false);
        res = await wallet.validPrivateKey({privateKey: ""});
        expect(res.isValid).toEqual(false);

        let p = Uint8Array.from(Array.from(Array(32).keys()))
        let res2 = await wallet.validPrivateKey({privateKey: 'ed25519:' + base.base58.encode(p)});
        expect(res2.isValid).toEqual(true);

        res2 = await wallet.validPrivateKey({privateKey: 'ed25519:' + "111222"});
        expect(res2.isValid).toEqual(false);
    });

    test("signMessage", async () => {

        const message = "log me in";
        const nonce = Buffer.from(Array.from(Array(32).keys()));
        const recipient = "http://localhost:3000";
        const callbackUrl = "http://localhost:1234";
        const payload = new MessagePayload({
            message,
            nonce,
            recipient,
            callbackUrl
        });
        let borshPayload = serialize(SCHEMA, payload);

        expect(Buffer.from(borshPayload).toString('hex')).toEqual("9d010080090000006c6f67206d6520696e000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f15000000687474703a2f2f6c6f63616c686f73743a333030300115000000687474703a2f2f6c6f63616c686f73743a31323334");

        const hash = base.sha256(borshPayload);
        expect(Buffer.from(hash).toString('hex')).toEqual("35bbc2443c72cbc3997453cfef691f27740a397a8499aec87f4fddd9cb05ffee");

        let wallet = new NearWallet()
        let privateKey = "ed25519:5Y5W9HDZLWYi2vq2JFvwLNBue5z2RDyivs44T372T2XsxJwSttPzpuhwbnZnYyq7P7Ynb4GDdEQiQxHgzTLoLMUM";
        let res = await wallet.signMessage({
            privateKey: privateKey,
            data: {
                message,
                recipient,
                nonce,
                callbackUrl,
                state: ""
            }
        });
        console.log(res)
        const expected = "tLRCNeEZtT9MB7gj0yhL9TwF5bF0x6JAGz+H92R+SHtETxFcjv1CDP+u0Gy5/NZFqwcYpOVdm/zN6L1xERSgBg=="
        expect(res).toEqual(expected)
    })

    test("serialize", async () => {
        const encodedKey = "ed25519:5Y5W9HDZLWYi2vq2JFvwLNBue5z2RDyivs44T372T2XsxJwSttPzpuhwbnZnYyq7P7Ynb4GDdEQiQxHgzTLoLMUM"
        const parts = encodedKey.split(':');
        const pk = base.fromBase58(parts[1])
        const seedHex = base.toHex(pk.slice(0, 32))
        const publicKey = signUtil.ed25519.publicKeyCreate(base.fromHex(seedHex))
        console.log(base.toHex(publicKey))
        const newPublicKey = PublicKey.fromRaw(publicKey)
        {
            const action = addKey(newPublicKey, fullAccessKey())
            const message = serialize(SCHEMA, action)
            expect(base.toHex(message)).toEqual('050058064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba000000000000000001')
            console.info(base.toHex(message));
        }
        {
            const action = addKey(newPublicKey, functionCallAccessKey("a", ['a'], new BN(1)))
            const message = serialize(SCHEMA, action)
            expect(base.toHex(message)).toEqual('050058064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba00000000000000000001010000000000000000000000000000000100000061010000000100000061')
            console.info(base.toHex(message));
        }
        {
            const action = deleteKey(newPublicKey)
            const message = serialize(SCHEMA, action)
            // expect(base.toHex(message)).toEqual('050058064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba000000000000000001')
            console.info(base.toHex(message));
        }
        {
            const action = deleteAccount('58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba')
            const message = serialize(SCHEMA, action)
            expect(base.toHex(message)).toEqual('074000000035383036346265346162366130303937623663373934663563663139383365663336633630656138326331376538343838313037343333663633383662356261')
            console.info(base.toHex(message));
        }
        {
            const action = deployContract(base.toUtf8('58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba'))
            const message = serialize(SCHEMA, action)
            expect(base.toHex(message)).toEqual('014000000035383036346265346162366130303937623663373934663563663139383365663336633630656138326331376538343838313037343333663633383662356261')
            console.info(base.toHex(message));
        }
        {
            const data = base.toUtf8('{"amount":"1000000000000000000","receiver_id":"316e10e0e93bef0927f4b0bc48849759a42c218b0e81a39ccb8eb15f048b00e8"}')
            const action = functionCall("ft_transfer", data, new BN(10000000000), new BN(1))
            const message = serialize(SCHEMA, action)
            console.info(base.toHex(message));
            expect(base.toHex(message)).toEqual('020b00000066745f7472616e73666572710000007b22616d6f756e74223a2231303030303030303030303030303030303030222c2272656365697665725f6964223a2233313665313065306539336265663039323766346230626334383834393735396134326332313862306538316133396363623865623135663034386230306538227d00e40b540200000001000000000000000000000000000000')
        }
        {
            const action = stake(new BN(10000000000), newPublicKey)
            const message = serialize(SCHEMA, action)
            console.info(base.toHex(message));
            expect(base.toHex(message)).toEqual("0400e40b540200000000000000000000000058064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba")
        }

    })

    test("calcTxHash", async () => {
        let wallet = new NearWallet()
        let hash = await wallet.calcTxHash({data: 'QAAAAGVmYWQyY2VhNDI0MmYxOWViYTM2ZWEwMDM4MTYxZmM4MDNlMmFmNjY4MmI1NzVmYTFjNGU5ZDQ4ZjgwMTlkYWUA760s6kJC8Z66NuoAOBYfyAPir2aCtXX6HE6dSPgBna6qCtrYyWUAADwAAABkYWMxN2Y5NThkMmVlNTIzYTIyMDYyMDY5OTQ1OTdjMTNkODMxZWM3LmZhY3RvcnkuYnJpZGdlLm5lYXJQGfDQ+UQXdGLODkRoU+glv/VbEgD0YjEw6d5X/AoCmQEAAAACCwAAAGZ0X3RyYW5zZmVyYAAAAHsiYW1vdW50IjoiMTAiLCJyZWNlaXZlcl9pZCI6ImMxZjBmN2JjMGRlZWQ3ZDIxNTFlNzk4N2FkMmFjYTc0YjhlODU2YzFmODdlZmE5M2ZlYzFmZjQwNzViNGQ2ZTQifQBAehDzWgAAAQAAAAAAAAAAAAAAAAAAAABQce/VTTgXdDHc4EJB8wN2fD1TM7zpY4jePavjyCS+8qJUa8uln4EUVGNGoioUGdpXHc7H5p+ngYcYenoKWKcN'})
        expect(hash).toEqual('2tEcefgov4tfzy9aSwVgYgEEgDKB3Y3pRxnBetzLsx2L')
    })

    test("getNewAddress", async () => {
        let wallet = new NearWallet()
        let addr = await wallet.getNewAddress({privateKey: "ed25519:FvKauCqp1Ch85NVoGCgJD2RqvEpvzSiBUzs4S8c9GYUDgDuxSjBv219YboJ9ckfzgBXS171ZSLJaNS2rjDfWMS3"});
        expect(addr.address).toBe("c1f0f7bc0deed7d2151e7987ad2aca74b8e856c1f87efa93fec1ff4075b4d6e4");
        addr = await wallet.getNewAddress({privateKey: "fc81e6f42150458f53d8c42551a8ab91978a55d0e22b1fd890b85139086b93f8"});
        expect(addr.address).toBe("484bbda1d1ab3e89b83b423685a9d4cbe7a28b8b96bbbee51d0553b47e4db42f");
        addr = await wallet.getNewAddress({privateKey: "0xfc81e6f42150458f53d8c42551a8ab91978a55d0e22b1fd890b85139086b93f8"});
        expect(addr.address).toBe("484bbda1d1ab3e89b83b423685a9d4cbe7a28b8b96bbbee51d0553b47e4db42f");
        addr = await wallet.getNewAddress({privateKey: "0Xfc81e6f42150458f53d8c42551a8ab91978a55d0e22b1fd890b85139086b93f8"});
        expect(addr.address).toBe("484bbda1d1ab3e89b83b423685a9d4cbe7a28b8b96bbbee51d0553b47e4db42f");
        addr = await wallet.getNewAddress({privateKey: "0XFC81E6F42150458F53D8C42551A8AB91978A55D0E22B1FD890B85139086B93F8"});
        expect(addr.address).toBe("484bbda1d1ab3e89b83b423685a9d4cbe7a28b8b96bbbee51d0553b47e4db42f");
    })

    test("getDerivedPrivateKey", async () => {
        let wallet = new NearWallet()

        let mnemonic = "ensure net noodle crystal estate arrange then actor symbol menu term eyebrow";
        let param = {
            mnemonic: mnemonic,
            hdPath: await wallet.getDerivedPath({index: 0})
        };
        let privateKey = await wallet.getDerivedPrivateKey(param);
        console.info(privateKey);
        let addr = await wallet.getNewAddress({privateKey: privateKey})
        console.info(addr);
        expect(privateKey).toEqual('ed25519:5Y5W9HDZLWYi2vq2JFvwLNBue5z2RDyivs44T372T2XsxJwSttPzpuhwbnZnYyq7P7Ynb4GDdEQiQxHgzTLoLMUM')
        expect(addr.address).toEqual('58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba')
    });

    test("validateAddress", async () => {
        expect(validateAddress('58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba')).toEqual(true)
        expect(validateAddress('abc')).toEqual(true)
        expect(validateAddress('abc.near')).toEqual(true)
    })

    test("transfer", async () => {
        const encodedKey = "ed25519:5Y5W9HDZLWYi2vq2JFvwLNBue5z2RDyivs44T372T2XsxJwSttPzpuhwbnZnYyq7P7Ynb4GDdEQiQxHgzTLoLMUM"
        const parts = encodedKey.split(':');
        const pk = base.fromBase58(parts[1])
        const seedHex = base.toHex(pk.slice(0, 32))
        const addr = getAddress(seedHex)
        console.info(addr)
        const expected = "58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba"
        expect(addr).toEqual(expected);

        const r = validateAddress(addr)
        console.info(r)

        // from to must be account_id, not public key
        const to = "toAccount.testnet"
        const publicKey = publicKeyFromSeed(seedHex)

        // blockHash must from valid blocks within 24h
        const blockHash = "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN"

        const tx = createTransaction("zhangok.testnet", publicKey, to, 94623980000002, [], base.fromBase58(blockHash))

        const action = transfer(new BN(10).pow(new BN(24)))
        tx.actions.push(action)

        const [_, signedTx] = await signTransaction(tx, seedHex)

        // https://explorer.testnet.near.org/transactions/xxxx
        const result = base.toBase64(signedTx.encode())
        console.info(result)
        expect(result).toEqual("DwAAAHpoYW5nb2sudGVzdG5ldABYBkvkq2oAl7bHlPXPGYPvNsYOqCwX6EiBB0M/Y4a1ugITt1wPVgAAEQAAAHRvQWNjb3VudC50ZXN0bmV0ytPf7D6qP7aL2QKHW46Gp2lwz3e9xofS8hs16KrEWXUBAAAAAwAAAKHtzM4bwtMAAAAAAAAAG2EbimoecPO5+5bjvfrXVkBxIg0nhHpEG3qdW0rjn6pI99eEX0Bof0W5CXaLVBnr6RYu7BSJT6VSj599c9ntCA==")
    });


    test("ft_transfer", async () => {
        const encodedKey = "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj1234"
        const parts = encodedKey.split(':');
        const pk = base.fromBase58(parts[1])

        const seedHex = base.toHex(pk.slice(0, 32))
        const addr = getAddress(seedHex)
        console.info("addr", addr)

        const r = validateAddress(addr)
        console.info(r)

        // from to must be account_id, not public key
        const to = "316e10e0e93bef0927f4b0bc48849759a42c218b0e81a39ccb8eb15f048b00e8"
        const publicKey = publicKeyFromSeed(seedHex)
        console.log(publicKey.toString())
        // blockHash must from valid blocks within 24h
        const blockHash = "9Aq667zbNwCkEfxzKPmrEysV7Ay4Q58UyGVHxpWBmC2p"
        const tx = createTransaction("c1f0f7bc0deed7d2151e7987ad2aca74b8e856c1f87efa93fec1ff4075b4d6e4", publicKey, to, 104002256000013, [], base.fromBase58(blockHash))
        console.log(base.toHex(tx.encode()))
        const data = base.toUtf8('{"amount":"1000000000000000000","receiver_id":"316e10e0e93bef0927f4b0bc48849759a42c218b0e81a39ccb8eb15f048b00e8"}')
        const action = functionCall("ft_transfer", data, new BN(10000000000), new BN(1))
        tx.actions.push(action)
        console.log(base.toHex(tx.encode()))
        const [_, signedTx] = await signTransaction(tx, seedHex)

        // https://explorer.testnet.near.org/transactions/xxxx
        const result = base.toBase64(signedTx.encode())
        console.info(result)
        expect(result).toEqual("QAAAAGMxZjBmN2JjMGRlZWQ3ZDIxNTFlNzk4N2FkMmFjYTc0YjhlODU2YzFmODdlZmE5M2ZlYzFmZjQwNzViNGQ2ZTQAn+q47fDuvgSu5O9t4Vm92uQB0teflu7/a9eJoMg8oZ0NVIbpll4AAEAAAAAzMTZlMTBlMGU5M2JlZjA5MjdmNGIwYmM0ODg0OTc1OWE0MmMyMThiMGU4MWEzOWNjYjhlYjE1ZjA0OGIwMGU4eWIYfT7FAxjK3qM3SNY6qKLkNgTNuGdWVoJkbUwzYNUBAAAAAgsAAABmdF90cmFuc2ZlcnEAAAB7ImFtb3VudCI6IjEwMDAwMDAwMDAwMDAwMDAwMDAiLCJyZWNlaXZlcl9pZCI6IjMxNmUxMGUwZTkzYmVmMDkyN2Y0YjBiYzQ4ODQ5NzU5YTQyYzIxOGIwZTgxYTM5Y2NiOGViMTVmMDQ4YjAwZTgifQDkC1QCAAAAAQAAAAAAAAAAAAAAAAAAAAApaKmd6gyPfDKpIfUC3xnwOjiVfNYs0mhn8pRxeNRqwyr1A+5O/uTWEFgtjyLlq5DR6Jx8Fmk7H8KoNM7wDlQI")
    });

    //58064be4ab6a0097b6c794f5cf1983ef36c60ea82c17e8488107433f6386b5ba
    test("signTransaction", async () => {
        const encodedKey = "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj1234"
        const parts = encodedKey.split(':');
        const pk = base.fromBase58(parts[1])

        const seedHex = base.toHex(pk.slice(0, 32))
        const addr = getAddress(seedHex)
        console.info(addr)

        const to = "toAccount.testnet"
        const publicKey = publicKeyFromSeed(seedHex)

        // blockHash must from valid blocks within 24h
        const blockHash = "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN"
        const r = {
            "receiverId": "wrap.testnet",
            "actions": [
                {
                    "methodName": "near_deposit",
                    "args": {},
                    "deposit": "10000000000000000000000",
                    "gas": "1",
                }
            ]
        }

        // @ts-ignore
        let actions = r.actions.map(item => functionCall(item.methodName, item.args, new BN(item.gas!), new BN(item.deposit!)))

        // blockHash must from valid blocks within 24h
        // @ts-ignore
        const [_, signedTx] = await signTransaction(to, 1, actions, base.fromBase58(blockHash), seedHex, addr)

        // https://explorer.testnet.near.org/transactions/xxxx
        const result = base.toBase64(signedTx.encode())
        console.info(result)
        expect(result).toEqual("QAAAADlmZWFiOGVkZjBlZWJlMDRhZWU0ZWY2ZGUxNTliZGRhZTQwMWQyZDc5Zjk2ZWVmZjZiZDc4OWEwYzgzY2ExOWQAn+q47fDuvgSu5O9t4Vm92uQB0teflu7/a9eJoMg8oZ0BAAAAAAAAABEAAAB0b0FjY291bnQudGVzdG5ldMrT3+w+qj+2i9kCh1uOhqdpcM93vcaH0vIbNeiqxFl1AQAAAAIMAAAAbmVhcl9kZXBvc2l0AgAAAHt9AQAAAAAAAAAAAECyusngGR4CAAAAAAAAADWQwzy4U96L98PW1z0SX6tZY30qh3epYf6t2nUTGL0u4lltKW3zseisPox+vNe2nB2lIjGzjPC10ADRi7Gp6gg=")
    });

    test("wallet-TransferNear", async () => {
        let wallet = new NearWallet();
        let param: SignTxParams = {
            privateKey: "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj1234",
            data: {
                blockHash: "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN",
                type: NearTypes.TransferNear,
                nonce: "1",
                receiverId: "wrap.testnet",
                amount: "1000000000000000000",
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual("QAAAADlmZWFiOGVkZjBlZWJlMDRhZWU0ZWY2ZGUxNTliZGRhZTQwMWQyZDc5Zjk2ZWVmZjZiZDc4OWEwYzgzY2ExOWQAn+q47fDuvgSu5O9t4Vm92uQB0teflu7/a9eJoMg8oZ0BAAAAAAAAAAwAAAB3cmFwLnRlc3RuZXTK09/sPqo/tovZAodbjoanaXDPd73Gh9LyGzXoqsRZdQEAAAADAABkp7O24A0AAAAAAAAAAAAuomoUieYAIBR1jzdeP2f4AEFOluGc8CO4bPhTKfnWxLTVf1/FzxhdrXoM21yqfS33MvWsKPG1xYfWMKdZrVcH")
    });


    test("wallet-TransferOthersNear", async () => {
        let wallet = new NearWallet();
        let param: SignTxParams = {
            privateKey: "ed25519:5nVkccj14V2f6RdfbisYWnW4DsgagVLZgWXZ25N9WVCN2AZuubjiR7sp9SFAkFA17WvVPneFm4B8rTfqjskSCvp",
            data: {
                blockHash: "9xqTnCLVNkP4dzKsTpLRw6R5bdChFNcvBtqaKStjMqvV",
                type: NearTypes.TransferNear,
                nonce: "113810099000001",
                from: 'efad2cea4242f19eba36ea0038161fc803e2af6682b575fa1c4e9d48f8019dae',
                receiverId: "efad2cea4242f19eba36ea0038161fc803e2af6682b575fa1c4e9d48f8019dae",
                amount: "1000",
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual("QAAAAGVmYWQyY2VhNDI0MmYxOWViYTM2ZWEwMDM4MTYxZmM4MDNlMmFmNjY4MmI1NzVmYTFjNGU5ZDQ4ZjgwMTlkYWUAE/el39kfW8IG2UmzIiQpSHEZ1soLzbbUu2cVzUBwGhXB0oV6gmcAAEAAAABlZmFkMmNlYTQyNDJmMTllYmEzNmVhMDAzODE2MWZjODAzZTJhZjY2ODJiNTc1ZmExYzRlOWQ0OGY4MDE5ZGFlhSs8WYgiewqDD72I1nEQcobue5JnXLvN4PRMJNyqJ74BAAAAA+gDAAAAAAAAAAAAAAAAAAAARsgCuf/nrpi5/iM2dOBjA0u3tO+kwjUsF0YbS3gViKoL0p+2ncpYbNgx6W+0qfbEDAvW6Y79jRj8kE4z4KxHCw==")
    });


    test("wallet-TransferToken", async () => {
        let wallet = new NearWallet();
        let param: SignTxParams = {
            privateKey: "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj1234",
            data: {
                blockHash: "6PgZMmVZauborXagh51hs1jRQcGj8Q83DRS5LxDjT8hW",
                type: NearTypes.TransferToken,
                nonce: '111917601000106',
                amount: "10",
                receiverId: 'c1f0f7bc0deed7d2151e7987ad2aca74b8e856c1f87efa93fec1ff4075b4d6e4',
                contract: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
                depositGas: '100000000000000',
                depositValue: '100000000000000',
                transferGas: '100000000000000',
                minTransferTokenValue: '1',
                shouldDeposit: false,
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual("QAAAADlmZWFiOGVkZjBlZWJlMDRhZWU0ZWY2ZGUxNTliZGRhZTQwMWQyZDc5Zjk2ZWVmZjZiZDc4OWEwYzgzY2ExOWQAn+q47fDuvgSu5O9t4Vm92uQB0teflu7/a9eJoMg8oZ2qCtrYyWUAADwAAABkYWMxN2Y5NThkMmVlNTIzYTIyMDYyMDY5OTQ1OTdjMTNkODMxZWM3LmZhY3RvcnkuYnJpZGdlLm5lYXJQGfDQ+UQXdGLODkRoU+glv/VbEgD0YjEw6d5X/AoCmQEAAAACCwAAAGZ0X3RyYW5zZmVyYAAAAHsiYW1vdW50IjoiMTAiLCJyZWNlaXZlcl9pZCI6ImMxZjBmN2JjMGRlZWQ3ZDIxNTFlNzk4N2FkMmFjYTc0YjhlODU2YzFmODdlZmE5M2ZlYzFmZjQwNzViNGQ2ZTQifQBAehDzWgAAAQAAAAAAAAAAAAAAAAAAAACwM4WogSetxw6ZaBqNbf3MOhiZqyMWMDtTtKfECWUrz8wQuxK9vPGCBw30z/KzIex0bAqssXM4FA4wfyXd7I4P")
    });

    test("wallet-DAppTx", async () => {
        let wallet = new NearWallet();
        let param: SignTxParams = {
            privateKey: "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj",
            data: {
                blockHash: "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN",
                type: NearTypes.DAppTx,
                nonce: 1,
                "receiverId": "wrap.testnet",
                "actions": [
                    {
                        "methodName": "near_deposit",
                        "args": {},
                        "deposit": "10000000000000000000000"
                    }
                ]
            }
        }
        let result = await wallet.signTransaction(param)
        expect(result).toEqual("QAAAADVhY2Y3N2M4MDQ3NWQ1Y2NkMzEwODI3ZTNiYTQ2MGQ4MzEyYmUwN2ZlMjRiNjg4OTJjN2Q4ZmI2ZDdlNDkxMzIA9gAyV7f0vO0NkNKZ/i9QeY4Psrqk0U07GW2Se5FE50ABAAAAAAAAAAwAAAB3cmFwLnRlc3RuZXTK09/sPqo/tovZAodbjoanaXDPd73Gh9LyGzXoqsRZdQEAAAACDAAAAG5lYXJfZGVwb3NpdAIAAAB7fQAAAAAAAAAAAABAsrrJ4BkeAgAAAAAAAADzpEm3+vL2aF6b6/qyg2la7yxvEqQ5P5aUqdkQJ77V+6VP6kpBJmjX8VEGdDdhiT39REe2MEiuzPxpQCetI9QN")
    });

    test("wallet-AddKey", async () => {
        let wallet = new NearWallet();
        // let randPrv = await wallet.getRandomPrivateKey()
        // console.info("randPrv",randPrv);
        // let randPub = await wallet.getNewAddress({privateKey: randPrv})
        // console.info("randPub",randPub);
        let randPub = {
            address: '13f7a5dfd91f5bc206d949b3222429487119d6ca0bcdb6d4bb6715cd40701a15',
            publicKey: 'ed25519:2LwmWPaqQ5964ecdn8a2kJW8QRUmt1CUvJMJgwhCC1ji'
        }
        let mnemonic = "ensure net noodle crystal estate arrange then actor symbol menu term eyebrow";
        let param2 = {
            mnemonic: mnemonic,
            hdPath: await wallet.getDerivedPath({index: 0})
        };
        let privateKey = await wallet.getDerivedPrivateKey(param2);
        console.info(privateKey);
        let addr = await wallet.getNewAddress({privateKey: privateKey})
        console.log('addr', addr)
        let accessKey: AccessKey = fullAccessKey()
        let param: SignTxParams = {
            privateKey: privateKey,
            data: {
                blockHash: "Fs3d3tQft43dTAVeqHuHm9g6Z5TLWfd8UG1b3kufVzXg",
                type: NearTypes.AddKey,
                nonce: '111917601000112',
                receiverId: addr.address,
                publicKey: randPub.publicKey,
                accessKey: accessKey,
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual("QAAAADU4MDY0YmU0YWI2YTAwOTdiNmM3OTRmNWNmMTk4M2VmMzZjNjBlYTgyYzE3ZTg0ODgxMDc0MzNmNjM4NmI1YmEAWAZL5KtqAJe2x5T1zxmD7zbGDqgsF+hIgQdDP2OGtbqwCtrYyWUAAEAAAAA1ODA2NGJlNGFiNmEwMDk3YjZjNzk0ZjVjZjE5ODNlZjM2YzYwZWE4MmMxN2U4NDg4MTA3NDMzZjYzODZiNWJh3NWfIjtBNw5jrbaBZCuyvitheQR8dwn5uSCVn/1KzPcBAAAABQAT96Xf2R9bwgbZSbMiJClIcRnWygvNttS7ZxXNQHAaFQAAAAAAAAAAAQAObMRyiT4Z78KyOIduBffa9BYUFqJ5k2442p4Ia3t7L0tAQLCe+f5dolSxF1tiojIwPTWPTSuFwYjG2oDbKYAJ")
    });

    test("wallet-DelKey", async () => {
        let wallet = new NearWallet();
        let mnemonic = "ensure net noodle crystal estate arrange then actor symbol menu term eyebrow";
        let param2 = {
            mnemonic: mnemonic,
            hdPath: await wallet.getDerivedPath({index: 0})
        };
        let privateKey = await wallet.getDerivedPrivateKey(param2);
        console.info(privateKey);
        let addr = await wallet.getNewAddress({privateKey: privateKey})
        console.log('addr', addr)
        let param: SignTxParams = {
            privateKey: privateKey,
            data: {
                blockHash: "Fs3d3tQft43dTAVeqHuHm9g6Z5TLWfd8UG1b3kufVzXg",
                type: NearTypes.DelKey,
                nonce: '111917601000115',
                receiverId: addr.address,
                publicKey: 'ed25519:2LwmWPaqQ5964ecdn8a2kJW8QRUmt1CUvJMJgwhCC1ji',
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual("QAAAADU4MDY0YmU0YWI2YTAwOTdiNmM3OTRmNWNmMTk4M2VmMzZjNjBlYTgyYzE3ZTg0ODgxMDc0MzNmNjM4NmI1YmEAWAZL5KtqAJe2x5T1zxmD7zbGDqgsF+hIgQdDP2OGtbqzCtrYyWUAAEAAAAA1ODA2NGJlNGFiNmEwMDk3YjZjNzk0ZjVjZjE5ODNlZjM2YzYwZWE4MmMxN2U4NDg4MTA3NDMzZjYzODZiNWJh3NWfIjtBNw5jrbaBZCuyvitheQR8dwn5uSCVn/1KzPcBAAAABgAT96Xf2R9bwgbZSbMiJClIcRnWygvNttS7ZxXNQHAaFQDE0uK00MmkgZYsDQsUUnaNj33h2wQOW1RnfE/kXRAFjSxwPYHnyhlsUTxJ21McSpB/pusVNtaZyHwnd3f6v6cH")
    });

    test("wallet-DAppTxs", async () => {
        let wallet = new NearWallet();
        let param: SignTxParams = {
            privateKey: "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj",
            data: {
                blockHash: "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN",
                type: NearTypes.DAppTxs,
                nonce: 1,
                transactions: [{
                    "receiverId": "wrap.testnet",
                    "actions": [
                        {
                            "methodName": "near_deposit",
                            "args": {},
                            "deposit": "10000000000000000000000"
                        }
                    ]
                }]
            }
        }
        let result = await wallet.signTransaction(param)
        console.info(result)
        expect(result).toEqual(["QAAAADVhY2Y3N2M4MDQ3NWQ1Y2NkMzEwODI3ZTNiYTQ2MGQ4MzEyYmUwN2ZlMjRiNjg4OTJjN2Q4ZmI2ZDdlNDkxMzIA9gAyV7f0vO0NkNKZ/i9QeY4Psrqk0U07GW2Se5FE50ABAAAAAAAAAAwAAAB3cmFwLnRlc3RuZXTK09/sPqo/tovZAodbjoanaXDPd73Gh9LyGzXoqsRZdQEAAAACDAAAAG5lYXJfZGVwb3NpdAIAAAB7fQAAAAAAAAAAAABAsrrJ4BkeAgAAAAAAAADzpEm3+vL2aF6b6/qyg2la7yxvEqQ5P5aUqdkQJ77V+6VP6kpBJmjX8VEGdDdhiT39REe2MEiuzPxpQCetI9QN",])
    });

    test("createAccount", async () => {
        const encodedKey = "ed25519:4yNHZKYxR4bk76CZ3MFQxpMeavbPTJVuGNrPZSBp5nzZTc64w35xmrGggbTWLHM1sUJCN5moESgsZKbDVDCj1234"
        const parts = encodedKey.split(':');
        const pk = base.fromBase58(parts[1])

        const newSeed = base.randomBytes(32)
        console.info(base.toHex(newSeed))
        const newPublicKey = publicKeyFromSeed(base.toHex(newSeed))

        const seedHex = base.toHex(pk.slice(0, 32))
        const addr = getAddress(seedHex)
        console.info(addr)

        const r = validateAddress(addr)
        console.info(r)

        // from to must be account_id, not public key
        const to = "toAccount.testnet"
        const publicKey = publicKeyFromSeed(seedHex)

        // blockHash must from valid blocks within 24h
        const blockHash = "EekjoegUYx2iibbWDuUSQENYCvUGkxj2Et1hTonbwBuN"

        const tx = createTransaction("zhangok.testnet", publicKey, to, 94623980000003, [], base.fromBase58(blockHash))

        const action = createAccount()
        tx.actions.push(action)

        const action2 = addKey(newPublicKey, fullAccessKey())
        tx.actions.push(action2)

        const [_, signedTx] = await signTransaction(tx, seedHex)

        const result = base.toBase64(signedTx.encode())
        console.info(result)
        const expected = "DwAAAHpoYW5nb2sudGVzdG5ldACf6rjt8O6+BK7k723hWb3a5AHS15+W7v9r14mgyDyhnQMTt1wPVgAAEQAAAHRvQWNjb3VudC50ZXN0bmV0ytPf7D6qP7aL2QKHW46Gp2lwz3e9xofS8hs16KrEWXUCAAAAAAUA"
        expect(result.startsWith(expected)).toBe(true)
    });
});
