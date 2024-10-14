CC_EDITOR ||
    (function () {
        cc.Action.prototype['getGroup'] = function () {
            return this.group;
        };

        cc.Action.prototype['setGroup'] = function (group) {
            this.group = group;
        };
    })();
