import EventEmmiter from 'events';
import HID from 'node-hid';

export class UsbIO2 extends EventEmmiter {
    constructor(interval=100 /* ms */) {
        super();

        this.inspect_interval = interval;  // unit: ms
        this.RW_CMD = [0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

        // USB-IO2.0 = VendorID: 0x1352, ProductID:0x0120
        this.device = new HID.HID(0x1352, 0x120);
        this.device.on('data', this._on_data.bind(this));
        this._prev_data = null;

        this._inspect();
    }

    close() {
        this.device.close();
    }

    _on_data(data) {
        // USB-IO2側の回路がプルアップしており、
        // ON、OFFが読み取ったデータ上0, 1となっているため、
        // 反転して、補正する。
        let now_data = (~((data[2] << 8) + data[1])) & 0x7f;

        if(now_data !== this._prev_data) {
            // ビットが 0 -> 1 になったところを検出
            // (prev_data XOR now_data) AND now_data
            const onbits = (this._prev_data ^ now_data) & now_data;
          //
            // ビットが 1 -> 0 になったところを検出
            // (prev_data XOR now_data) AND (NOT now_data)
            const offbits = (this._prev_data ^ now_data) & ~now_data;

            this.emit('changed', now_data, onbits, offbits);

            this._prev_data = now_data;
        }
    }

    _inspect() {
        try {
            this.device.write(this.RW_CMD);
        } catch(e) {
            console.log(`Ignore exception: ${e}`)
        }
        setTimeout(this._inspect.bind(this), this.inspect_interval);
    }
}
