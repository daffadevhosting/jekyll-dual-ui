/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
import { w as win } from './index6.js';

const getCapacitor = () => {
    if (win !== undefined) {
        return win.Capacitor;
    }
    return undefined;
};

export { getCapacitor as g };
