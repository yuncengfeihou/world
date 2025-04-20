import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { POPUP_TYPE, callGenericPopup } from '../../../popup.js';
import { getSortedEntries } from '../../../world-info.js'; // 导入核心函数

// --- 调试日志 1 ---
console.log("World Info Viewer: index.js 开始加载");

const extensionName = "world";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// --- 调试日志 2 ---
// 检查导入的函数是否有效
console.log("World Info Viewer: getSortedEntries function type:", typeof getSortedEntries);
console.log("World Info Viewer: callGenericPopup function type:", typeof callGenericPopup);

async function onFetchWorldInfoClick() {
    // --- 调试日志 5 ---
    console.log("World Info Viewer: onFetchWorldInfoClick 函数被调用");
    try {
        console.log("World Info Viewer: 正在调用 getSortedEntries...");
        const entries = await getSortedEntries();
        console.log("World Info Viewer: getSortedEntries 调用完成, 结果:", entries);

        if (!entries || entries.length === 0) {
            toastr.info("当前没有找到任何 World Info 条目。请检查全局、角色、聊天或 Persona 设置。", "无 World Info 条目");
            return;
        }

        let formattedHtml = `<div style="max-height: 70vh; overflow-y: auto;">`;
        formattedHtml += `<h3>共找到 ${entries.length} 个 World Info 条目</h3><hr>`;

        entries.forEach(entry => {
            const comment = entry.comment ? entry.comment.replace(/</g, "<").replace(/>/g, ">") : '<em>无注释/标题</em>';
            const content = entry.content ? entry.content.replace(/</g, "<").replace(/>/g, ">") : '<em>无内容</em>';
            const worldName = entry.world || '<em>未知来源</em>';
            const uid = entry.uid !== undefined ? entry.uid : '<em>未知 UID</em>';

            formattedHtml += `
                <div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                    <h4>${worldName} - Entry UID: ${uid}</h4>
                    <p><b>注释/标题:</b> ${comment}</p>
                    <p><b>内容:</b></p>
                    <pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f5f5f5; padding: 5px; border-radius: 3px;">${content}</pre>
                </div>
            `;
        });

        formattedHtml += `</div>`;

        console.log("World Info Viewer: 准备显示弹窗");
        await callGenericPopup(formattedHtml, POPUP_TYPE.TEXT, null, {
            large: true,
            allowVerticalScrolling: false,
            title: "当前 World Info 条目"
        });
        console.log("World Info Viewer: 弹窗已显示");

        toastr.success(`成功获取并显示了 ${entries.length} 个 World Info 条目。`);

    } catch (error) {
        // --- 调试日志 6 ---
        console.error("World Info Viewer: 获取或显示 World Info 时出错:", error);
        toastr.error("获取 World Info 时发生错误，请查看控制台获取详细信息。", "错误");
    }
}

jQuery(async () => {
    // --- 调试日志 3 ---
    console.log("World Info Viewer: DOM ready, 开始初始化插件UI");

    const settingsHtml = `
        <div class="world-info-viewer-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>World Info 查看器</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <p>点击下面的按钮获取当前所有适用的 World Info 条目 (来自全局、角色、聊天、Persona)。</p>
                    <div class="world-info-viewer-block flex-container">
                        <input id="fetch-world-info-button" class="menu_button" type="button" value="获取所有 World Info 条目" />
                    </div>
                    <hr class="sysHR" />
                </div>
            </div>
        </div>`;

    try {
        $("#extensions_settings").append(settingsHtml);
        console.log("World Info Viewer: HTML 已添加到页面");

        // --- 调试日志 4 ---
        const buttonElement = $("#fetch-world-info-button");
        console.log("World Info Viewer: 查找按钮元素:", buttonElement);
        if (buttonElement.length > 0) {
            console.log("World Info Viewer: 按钮元素已找到, 正在绑定点击事件...");
            buttonElement.on("click", onFetchWorldInfoClick);
            console.log("World Info Viewer: 点击事件已绑定");
        } else {
            console.error("World Info Viewer: 未能找到 ID 为 fetch-world-info-button 的按钮元素!");
        }
    } catch (error) {
        console.error("World Info Viewer: 初始化UI或绑定事件时出错:", error);
    }

    console.log("World Info Viewer: 插件初始化完成");
});
