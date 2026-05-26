<template>
    <div class="max-[944px]:pt-14">
        <div class="header-row mb-3">
            <div class="header-left">
                <h2 class="header-title">
                    <span v-if="activeTab === 'behavior'">รายการพฤติกรรม</span>
                    <span v-else>รายการบำเพ็ญประโยชน์</span>
                </h2>
            </div>
            <component :is="activeTab === 'behavior' ? 'CreateBehavior' : 'CreateMerit'"
                @created="activeTab === 'behavior' ? handleCreated($event) : handleCreatedMerit()" />
        </div>
        <div class="toggle-group">
            <input type="checkbox" id="toggleTab" v-model="isMerit" class="toggle-input" />
            <label for="toggleTab" class="toggle-label">
                <span class="toggle-label-inner">
                    <span v-if="isMerit" class="toggle-label-text-inner active left">เพิ่ม</span>

                    <span class="spacer"></span>

                    <span v-if="!isMerit" class="toggle-label-text-inner active right">หัก</span>
                </span>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div>
            <component :is="activeTab === 'behavior' ? 'BehaviorList' : 'MeritTypeTable'" ref="behaviorList"
                :expandedTypeId="activeTab === 'behavior' ? expandedTypeId : undefined"
                :expandedBehaviorId="activeTab === 'behavior' ? expandedBehaviorId : undefined" />
        </div>
    </div>
</template>

<script>
import BehaviorList from '../../components/Behavior/BehaviorList.vue';
import CreateBehavior from '../../components/Behavior/Create.vue';
import MeritTypeTable from '../../components/Merit/MeritTypeTable.vue';
import CreateMerit from '../../components/Merit/Create.vue';

export default {
    name: 'BehaviorPage',
    components: {
        BehaviorList,
        CreateBehavior,
        MeritTypeTable,
        CreateMerit,
    },
    data() {
        return {
            expandedTypeId: null,
            expandedBehaviorId: null,
            isMerit: false,
        };
    },
    computed: {
        activeTab() {
            return this.isMerit ? 'merit' : 'behavior';
        },
    },
    methods: {
        handleCreated(payload) {
            this.expandedTypeId = payload.typeId;
            this.expandedBehaviorId = payload.behaviorId;
            this.$refs.behaviorList && this.$refs.behaviorList.fetchBehaviortypes && this.$refs.behaviorList.fetchBehaviortypes();
        },
        handleCreatedMerit() {
            if (this.activeTab === 'merit' && this.$refs.behaviorList && this.$refs.behaviorList.getMeritTypes) {
                this.$refs.behaviorList.getMeritTypes();
            }
        },
    },
};
</script>

<style scoped>
.header-row {
    display: flex;
    align-items: center !important;
    justify-content: space-between;
    gap: 1.5rem;
}

.header-left {
    flex: 1;
}

.header-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 0;
}

.toggle-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: flex-end;
}

.toggle-label-inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    z-index: 1;
    pointer-events: none;
}

.toggle-label-text-inner {
    font-size: 0.9rem;
    font-weight: 700;
    color: #2563eb;
    transition: opacity 0.2s;
    white-space: nowrap;
}

.toggle-label-text-inner.active {
    color: #2563eb;
    font-weight: 700;
}

.toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    display: inline-block;
}

.toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-label {
    display: block;
    width: 75px;
    height: 32px;
    background: #fff;
    border-radius: 32px;
    position: relative;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    background: #2563eb;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 2;
}

.toggle-input:checked+.toggle-label .toggle-slider {
    left: calc(100% - 29px);
}

.spacer {
    flex: 1;
}

.header-right>.toggle-group {
    margin-right: 1rem;
}

@media (max-width: 700px) {

    .header-right {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-end;
    }
}
</style>
