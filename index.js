import { extension_settings } from "../../../extensions.js"; // 用于插件设置（虽然此插件未使用）
import { saveSettingsDebounced } from "../../../../script.js"; // 用于保存设置（虽然此插件未使用）
import { POPUP_TYPE, callGenericPopup } from '../../../popup.js'; // 用于显示弹窗
import { getSortedEntries } from '../world-info.js'; // 导入核心函数

const extensionName = "world-info-viewer"; // 必须与插件文件夹名称一致
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
// const extensionSettings = extension_settings[extensionName]; // 如果需要设置，取消注释
// const defaultSettings = {}; // 如果需要设置，定义默认值

// 加载设置的函数（此插件简单，暂不需要复杂设置逻辑）
// async function loadSettings() {
//     extension_settings[extensionName] = extension_settings[extensionName] || {};
//     if (Object.keys(extension_settings[extensionName]).length === 0) {
//         Object.assign(extension_settings[extensionName], defaultSettings);
//     }
// }

// 按钮点击事件处理函数
async function onFetchWorldInfoClick() {
    try {
        // 调用 world-info.js 的函数获取所有条目
        const entries = await getSortedEntries();

        if (!entries || entries.length === 0) {
            toastr.info("当前没有找到任何 World Info 条目。请检查全局、角色、聊天或 Persona 设置。", "无 World Info 条目");
            return;
        }

        // 格式化条目以便在弹窗中显示
        let formattedHtml = `<div style="max-height: 70vh; overflow-y: auto;">`; // 添加滚动条
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

        // 显示弹窗
        await callGenericPopup(formattedHtml, POPUP_TYPE.TEXT, null, {
            large: true, // 使用大弹窗
            allowVerticalScrolling: false, // 内部 div 已经处理滚动
            title: "当前 World Info 条目"
        });

        toastr.success(`成功获取并显示了 ${entries.length} 个 World Info 条目。`);

    } catch (error) {
        console.error("获取 World Info 时出错:", error);
        toastr.error("获取 World Info 时发生错误，请查看控制台获取详细信息。", "错误");
    }
}

// 插件初始化入口
jQuery(async () => {
    // 创建设置界面的 HTML
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

    // 将 HTML 添加到扩展设置页面
    $("#extensions_settings").append(settingsHtml);

    // 为按钮绑定点击事件
    $("#fetch-world-info-button").on("click", onFetchWorldInfoClick);

    // 加载设置（如果需要）
    // await loadSettings();
});
