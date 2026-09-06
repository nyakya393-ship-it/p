/*
=========================================
Splatoon 3 Weapon Analyzer
Wiki Dynamic Version
=========================================
*/


const API =
    "https://splatoonwiki.org/w/api.php";


const WIKI =
    "https://splatoonwiki.org/wiki/";


/*
=========================================
カテゴリ
=========================================
*/

const categories = [

    "すべて",

    "シューター",

    "ローラー",

    "チャージャー",

    "スピナー",

    "マニューバー",

    "ブラスター",

    "フデ",

    "スロッシャー",

    "シェルター",

    "ワイパー",

    "ストリンガー"

];


let weapons = [];

let selectedWeapon = null;

let selectedCategory = "すべて";


/*
=========================================
Wiki API
=========================================
*/

async function wikiAPI(
    params
) {

    const query =
        new URLSearchParams({

            ...params,

            format:
                "json",

            origin:
                "*"

        });


    const response =
        await fetch(
            API +
            "?" +
            query.toString()
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Wiki API connection failed"
        );

    }


    return await response.json();

}


/*
=========================================
武器一覧
=========================================
*/

async function getWeaponList() {

    const data =
        await wikiAPI({

            action:
                "parse",

            page:
                "List_of_main_weapons_in_Splatoon_3",

            prop:
                "text",

            disablelimitreport:
                "1",

            disableeditsection:
                "1"

        });


    const html =
        data
            ?.parse
            ?.text
            ?["*"];


    if (
        !html
    ) {

        throw new Error(
            "武器一覧を取得できませんでした"
        );

    }


    const parser =
        new DOMParser();


    const doc =
        parser.parseFromString(
            html,
            "text/html"
        );


    const result = [];


    const tables =
        [
            ...doc.querySelectorAll(
                "table"
            )
        ];


    for (
        const table
        of tables
    ) {

        const rows =
            [
                ...table.querySelectorAll(
                    "tr"
                )
            ];


        for (
            const row
            of rows
        ) {

            const links =
                [
                    ...row.querySelectorAll(
                        "a"
                    )
                ];


            const weaponLink =
                links.find(
                    link => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        return (
                            href &&
                            href.startsWith(
                                "/wiki/"
                            )
                        );

                    }
                );


            if (
                !weaponLink
            ) {

                continue;

            }


            const name =
                weaponLink
                    .textContent
                    .trim();


            const href =
                weaponLink
                    .getAttribute(
                        "href"
                    );


            if (
                !name ||
                !href
            ) {

                continue;

            }


            if (
                name ===
                "Main"
            ) {

                continue;

            }


            if (
                result.some(
                    weapon =>
                        weapon.page ===
                        href
                )
            ) {

                continue;

            }


            const cells =
                [
                    ...row.querySelectorAll(
                        "td,th"
                    )
                ];


            const rowText =
                row.textContent
                    .replace(
                        /\s+/g,
                        " "
                    );


            const type =
                detectCategory(
                    rowText
                );


            result.push({

                name:

                    cleanWeaponName(
                        name
                    ),

                page:

                    decodeURIComponent(
                        href.replace(
                            "/wiki/",
                            ""
                        )
                    ),

                type

            });

        }

    }


    return result;

}


/*
=========================================
武器名の整理
=========================================
*/

function cleanWeaponName(
    name
) {

    return name
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/*
=========================================
カテゴリ判定
=========================================
*/

function detectCategory(
    text
) {

    const map = [

        [
            "Shooter",
            "シューター"
        ],

        [
            "Roller",
            "ローラー"
        ],

        [
            "Charger",
            "チャージャー"
        ],

        [
            "Splatling",
            "スピナー"
        ],

        [
            "Dualie",
            "マニューバー"
        ],

        [
            "Blaster",
            "ブラスター"
        ],

        [
            "Brush",
            "フデ"
        ],

        [
            "Slosher",
            "スロッシャー"
        ],

        [
            "Brella",
            "シェルター"
        ],

        [
            "Stringer",
            "ストリンガー"
        ],

        [
            "Splatana",
            "ワイパー"
        ]

    ];


    for (
        const item
        of map
    ) {

        if (
            text.includes(
                item[0]
            )
        ) {

            return item[1];

        }

    }


    return "その他";

}


/*
=========================================
武器ページ取得
=========================================
*/

async function getWeaponPage(
    weapon
) {

    const data =
        await wikiAPI({

            action:
                "parse",

            page:
                weapon.page,

            prop:
                "text",

            disablelimitreport:
                "1",

            disableeditsection:
                "1"

        });


    const html =
        data
            ?.parse
            ?.text
            ?["*"];


    if (
        !html
    ) {

        return null;

    }


    return html;

}


/*
=========================================
画像取得
=========================================
*/

async function getWeaponImage(
    weapon
) {

    try {

        /*
        pageimagesを使って
        Wikiページの代表画像を取得
        */

        const data =
            await wikiAPI({

                action:
                    "query",

                prop:
                    "pageimages",

                piprop:
                    "thumbnail",

                pithumbsize:
                    "500",

                titles:
                    weapon.page

            });


        const pages =
            data
                ?.query
                ?.pages;


        if (
            !pages
        ) {

            return null;

        }


        const page =
            Object.values(
                pages
            )[0];


        if (
            page &&
            page.thumbnail &&
            page.thumbnail.source
        ) {

            return page.thumbnail.source;

        }


    } catch (
        error
    ) {

        console.warn(
            "Image API error",
            error
        );

    }


    return null;

}


/*
=========================================
HTML解析
=========================================
*/

function parseHTML(
    html
) {

    const parser =
        new DOMParser();


    return parser.parseFromString(
        html,
        "text/html"
    );

}


/*
=========================================
Splatoon 3セクション
=========================================
*/

function getSplatoon3Section(
    doc
) {

    const headings =
        [
            ...doc.querySelectorAll(
                "h2,h3"
            )
        ];


    let heading =
        headings.find(
            h =>
                h.textContent
                    .trim()
                    .includes(
                        "Splatoon 3"
                    )
        );


    if (
        !heading
    ) {

        return doc;

    }


    const section =
        document.createElement(
            "div"
        );


    let current =
        heading.nextElementSibling;


    while (
        current
    ) {

        if (
            /^H[23]$/
                .test(
                    current.tagName
                )
        ) {

            break;

        }


        section.appendChild(
            current.cloneNode(
                true
            )
        );


        current =
            current.nextElementSibling;

    }


    return section;

}


/*
=========================================
テキスト
=========================================
*/

function getText(
    element
) {

    return element
        .textContent
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/*
=========================================
数値
=========================================
*/

function numberFrom(
    text,
    patterns
) {

    for (
        const pattern
        of patterns
    ) {

        const match =
            text.match(
                pattern
            );


        if (
            match
        ) {

            return Number(
                match[1]
            );

        }

    }


    return null;

}


/*
=========================================
ダメージ解析
=========================================
*/

function extractDamage(
    text
) {

    return numberFrom(
        text,
        [

            /Base damage\s+(\d+(?:\.\d+)?)/i,

            /base damage of\s+(\d+(?:\.\d+)?)/i,

            /base damage is\s+(\d+(?:\.\d+)?)/i,

            /direct hit.*?(\d+(?:\.\d+)?)/i

        ]
    );

}


/*
=========================================
最低ダメージ
=========================================
*/

function extractMinimumDamage(
    text
) {

    return numberFrom(
        text,
        [

            /minimum damage of\s+(\d+(?:\.\d+)?)/i,

            /minimum damage\s+(\d+(?:\.\d+)?)/i,

            /until it reaches\s+(\d+(?:\.\d+)?)\s+damage/i

        ]
    );

}


/*
=========================================
有効射程
=========================================
*/

function extractEffectiveRange(
    text
) {

    return numberFrom(
        text,
        [

            /effective range is about\s+(\d+(?:\.\d+)?)/i,

            /effective range of about\s+(\d+(?:\.\d+)?)/i,

            /effective range\s+(\d+(?:\.\d+)?)/i

        ]
    );

}


/*
=========================================
基本射程
=========================================
*/

function extractRange(
    text
) {

    return numberFrom(
        text,
        [

            /Range\s+(\d+(?:\.\d+)?)\s*\/\s*100/i,

            /Base range\s+(\d+(?:\.\d+)?)/i,

            /range of\s+(\d+(?:\.\d+)?)/i

        ]
    );

}


/*
=========================================
爆風
=========================================
*/

function extractBlast(
    text
) {

    return numberFrom(
        text,
        [

            /full blast radius of\s+(\d+(?:\.\d+)?)\s+units/i,

            /full blast radius\s+(\d+(?:\.\d+)?)/i,

            /50 damage radius.*?(\d+(?:\.\d+)?)\s+units/i,

            /far damage radius.*?(\d+(?:\.\d+)?)\s+units/i

        ]
    );

}


/*
=========================================
近距離爆風
=========================================
*/

function extractNearBlast(
    text
) {

    return numberFrom(
        text,
        [

            /near blast radius of\s+(\d+(?:\.\d+)?)\s+units/i,

            /near damage radius of\s+(\d+(?:\.\d+)?)\s+units/i,

            /70 damage radius.*?(\d+(?:\.\d+)?)\s+units/i

        ]
    );

}


/*
=========================================
Sub
=========================================
*/

function extractInfoField(
    doc,
    label
) {

    const rows =
        [
            ...doc.querySelectorAll(
                "tr"
            )
        ];


    for (
        const row
        of rows
    ) {

        const text =
            getText(
                row
            );


        if (
            text
                .toLowerCase()
                .startsWith(
                    label.toLowerCase()
                )
        ) {

            const cells =
                [
                    ...row.querySelectorAll(
                        "td,th"
                    )
                ];


            if (
                cells.length >= 2
            ) {

                return getText(
                    cells[
                        cells.length - 1
                    ]
                );

            }

        }

    }


    return "—";

}


/*
=========================================
1武器の完全データ取得
=========================================
*/

async function loadWeaponData(
    weapon
) {

    const html =
        await getWeaponPage(
            weapon
        );


    if (
        !html
    ) {

        return null;

    }


    const doc =
        parseHTML(
            html
        );


    const section =
        getSplatoon3Section(
            doc
        );


    const text =
        getText(
            section
        );


    const image =
        await getWeaponImage(
            weapon
        );


    return {

        ...weapon,

        image,

        damage:
            extractDamage(
                text
            ),

        minimumDamage:
            extractMinimumDamage(
                text
            ),

        range:
            extractRange(
                text
            ),

        effectiveRange:
            extractEffectiveRange(
                text
            ),

        blast:
            extractBlast(
                text
            ),

        nearBlast:
            extractNearBlast(
                text
            ),

        sub:
            extractInfoField(
                section,
                "Sub"
            ),

        special:
            extractInfoField(
                section,
                "Special"
            ),

        specialPoints:
            extractInfoField(
                section,
                "Special points"
            ),

        ink:
            extractInfoField(
                section,
                "Ink consumption"
            )

    };

}


/*
=========================================
ローディング
=========================================
*/

function setStatus(
    text
) {

    const element =
        document.getElementById(
            "wikiStatus"
        );


    element.textContent =
        text;

}


function setLoading(
    text
) {

    const list =
        document.getElementById(
            "weaponList"
        );


    if (
        weapons.length === 0
    ) {

        list.innerHTML = `

            <div class="loading">
                ${text}
            </div>

        `;

    }

}


/*
=========================================
カテゴリ描画
=========================================
*/

function renderCategories() {

    const container =
        document.getElementById(
            "categories"
        );


    container.innerHTML =
        categories
            .map(
                category => `

                    <button
                        class="
                            category
                            ${
                                category ===
                                selectedCategory
                                    ? "active"
                                    : ""
                            }
                    "
                        data-category="
                            ${category}
                        "
                    >
                        ${category}
                    </button>

                `
            )
            .join("");


    container
        .querySelectorAll(
            ".category"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        selectedCategory =
                            button.dataset
                                .category;


                        renderCategories();

                        renderWeaponList();

                    }
                );

            }
        );

}


/*
=========================================
武器一覧描画
=========================================
*/

function renderWeaponList() {

    const container =
        document.getElementById(
            "weaponList"
        );


    let list =
        weapons;


    if (
        selectedCategory !==
        "すべて"
    ) {

        list =
            weapons.filter(
                weapon =>
                    weapon.type ===
                    selectedCategory
            );

    }


    container.innerHTML =
        list
            .map(
                weapon => `

                    <div
                        class="
                            weapon
                            ${
                                selectedWeapon &&
                                selectedWeapon.page ===
                                weapon.page
                                    ? "active"
                                    : ""
                            }
                        "
                        data-page="
                            ${encodeURIComponent(
                                weapon.page
                            )}
                    >

                        <div
                            class="weapon-icon"
                        >

                            ${
                                weapon.image
                                    ? `
                                        <img
                                            src="${weapon.image}"
                                            alt=""
                                            loading="lazy"
                                        >
                                    `
                                    : ""
                            }

                        </div>


                        <div>

                            <div
                                class="weapon-name"
                            >
                                ${weapon.name}
                            </div>


                            <div
                                class="weapon-type"
                            >
                                ${weapon.type}
                            </div>

                        </div>

                    </div>

                `
            )
            .join("");


    container
        .querySelectorAll(
            ".weapon"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    () => {

                        const page =
                            decodeURIComponent(
                                element.dataset.page
                            );


                        selectedWeapon =
                            weapons.find(
                                weapon =>
                                    weapon.page ===
                                    page
                            );


                        renderWeaponList();

                        renderAll();

                    }
                );

            }
        );

}


/*
=========================================
ヘッダー
=========================================
*/

function renderHeader() {

    const weapon =
        selectedWeapon;


    if (
        !weapon
    ) {

        return;

    }


    document.getElementById(
        "weaponHeader"
    ).innerHTML = `

        <div
            class="weapon-information"
        >

            <div
                class="weapon-large-icon"
            >

                ${
                    weapon.image
                        ? `
                            <img
                                src="${weapon.image}"
                                alt="${weapon.name}"
                            >
                        `
                        : ""
                }

            </div>


            <div>

                <h1>
                    ${weapon.name}
                </h1>


                <div
                    class="weapon-description"
                >
                    Wikiから取得した
                    Splatoon 3データ
                </div>


                <div
                    class="weapon-badge"
                >
                    ${weapon.type}
                </div>

            </div>

        </div>


        <div
            class="quick-stats"
        >

            <div class="quick-stat">

                <span>
                    ダメージ
                </span>

                <strong>
                    ${weapon.damage ?? "—"}
                </strong>

            </div>


            <div class="quick-stat">

                <span>
                    最低ダメージ
                </span>

                <strong>
                    ${weapon.minimumDamage ?? "—"}
                </strong>

            </div>


            <div class="quick-stat">

                <span>
                    射程
                </span>

                <strong>
                    ${weapon.range ?? "—"}
                </strong>

            </div>


            <div class="quick-stat">

                <span>
                    有効射程
                </span>

                <strong>
                    ${weapon.effectiveRange ?? "—"}
                </strong>

            </div>


        </div>

    `;

}


/*
=========================================
射程
=========================================
*/

function renderRange() {

    const weapon =
        selectedWeapon;


    const range =
        Number(
            weapon.effectiveRange ??
            weapon.range
        ) || 0;


    /*
    これは表示用のスケール。

    WikiのRange / 100と
    実距離unitsは別物なので、
    数値を勝手に同一単位にはしない。
    */

    const max =
        Math.max(
            8,
            range
        );


    const percent =
        Math.min(
            100,
            range /
            max *
            100
        );


    const blast =
        Number(
            weapon.blast
        ) || 0;


    const near =
        Number(
            weapon.nearBlast
        ) || 0;


    const blastPercent =
        Math.min(
            35,
            blast /
            max *
            100
        );


    const nearPercent =
        Math.min(
            35,
            near /
            max *
            100
        );


    let blastHTML =
        "";


    if (
        weapon.type ===
        "ブラスター" &&
        blast > 0
    ) {

        blastHTML = `

            <div
                class="blast-circle"
                style="
                    left:${percent}%;

                    width:
                        ${blastPercent * 2}%;

                    height:
                        ${blastPercent * 2}%;

                    margin-left:
                        -${blastPercent}%;
                "
            ></div>


            ${
                near > 0
                    ? `
                        <div
                            class="
                                blast-circle
                                near
                            "
                            style="
                                left:${percent}%;

                                width:
                                    ${nearPercent * 2}%;

                                height:
                                    ${nearPercent * 2}%;

                                margin-left:
                                    -${nearPercent}%;
                            "
                        ></div>
                    `
                    : ""
            }


            <div
                class="blast-center"
                style="
                    left:${percent}%;
                "
            ></div>

        `;

    }


    document.getElementById(
        "rangeGraph"
    ).innerHTML = `

        <div
            class="range-row"
        >

            <div
                class="range-label"
            >
                攻撃地点 / 爆風中心
            </div>


            <div
                class="range-bar"
                style="
                    width:${percent}%;
                "
            ></div>


            ${blastHTML}


            <div
                class="range-value"
            >
                ${
                    weapon.effectiveRange ??
                    weapon.range ??
                    "—"
                }
            </div>

        </div>

    `;

}


/*
=========================================
爆風
=========================================
*/

function renderBlast() {

    const weapon =
        selectedWeapon;


    const container =
        document.getElementById(
            "blastGraph"
        );


    const blast =
        Number(
            weapon.blast
        ) || 0;


    const near =
        Number(
            weapon.nearBlast
        ) || 0;


    if (
        weapon.type !==
            "ブラスター" ||
        blast <= 0
    ) {

        container.innerHTML = `

            <div
                style="
                    color:#657187;
                    font-size:11px;
                "
            >
                この武器には爆風範囲データがありません
            </div>

        `;

        return;

    }


    const maxSize =
        190;


    const outer =
        Math.min(
            maxSize,
            blast /
            3.5 *
            maxSize
        );


    const inner =
        Math.min(
            maxSize,
            near /
            3.5 *
            maxSize
        );


    container.innerHTML = `

        <div
            class="blast-circle-view"
            style="
                width:${outer}px;
                height:${outer}px;
            "
        ></div>


        ${
            inner > 0
                ? `
                    <div
                        class="
                            blast-circle-view
                            near
                        "
                        style="
                            width:${inner}px;
                            height:${inner}px;
                        "
                    ></div>
                `
                : ""
        }


        <div
            class="blast-point"
        ></div>


        <div
            class="blast-distance"
        >
            最大爆風半径：
            ${blast}
            units
        </div>

    `;

}


/*
=========================================
ダメージ
=========================================
*/

function getDamageAtDistance(
    weapon,
    distance
) {

    const base =
        Number(
            weapon.damage
        );


    const minimum =
        Number(
            weapon.minimumDamage
        );


    if (
        !base
    ) {

        return 0;

    }


    /*
    Wikiに最低ダメージが
    掲載されている通常武器
    */

    const range =
        Number(
            weapon.effectiveRange ??
            weapon.range
        ) || 0;


    if (
        minimum &&
        range > 0 &&
        distance > range
    ) {

        const decay =
            Math.min(
                1,
                (
                    distance -
                    range
                ) /
                Math.max(
                    1,
                    range
                )
            );


        return (
            base -
            (
                base -
                minimum
            ) *
            decay
        );

    }


    /*
    ブラスター
    */

    if (
        weapon.type ===
        "ブラスター" &&
        weapon.blast
    ) {

        if (
            distance <= range
        ) {

            return base;

        }


        const d =
            distance -
            range;


        const near =
            Number(
                weapon.nearBlast
            ) || 0;


        const blast =
            Number(
                weapon.blast
            ) || 0;


        if (
            near &&
            d <= near
        ) {

            return Math.min(
                base,
                70
            );

        }


        if (
            blast &&
            d <= blast
        ) {

            const ratio =
                (
                    d -
                    near
                ) /
                Math.max(
                    .001,
                    blast -
                    near
                );


            return (
                70 -
                20 *
                ratio
            );

        }


        return 0;

    }


    return minimum ||
        base;

}


/*
=========================================
ダメージグラフ
=========================================
*/

function renderDamage() {

    const weapon =
        selectedWeapon;


    const graph =
        document.getElementById(
            "damageGraph"
        );


    const range =
        Number(
            weapon.effectiveRange ??
            weapon.range
        ) || 5;


    const blast =
        Number(
            weapon.blast
        ) || 0;


    const maxDistance =
        Math.max(
            8,
            range +
            blast
        );


    const count =
        16;


    graph.innerHTML =
        "";


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const distance =
            maxDistance *
            i /
            (count - 1);


        const damage =
            getDamageAtDistance(
                weapon,
                distance
            );


        const bar =
            document.createElement(
                "div"
            );


        bar.className =
            "damage-bar";


        bar.style.height =
            Math.max(
                2,
                Math.min(
                    100,
                    damage /
                    180 *
                    100
                )
            ) +
            "%";


        bar.innerHTML = `

            <span
                class="damage-value"
            >
                ${damage.toFixed(1)}
            </span>


            <small
                class="damage-distance"
            >
                ${distance.toFixed(1)}
            </small>

        `;


        graph.appendChild(
            bar
        );

    }

}


/*
=========================================
距離減衰
=========================================
*/

function renderDecay() {

    const weapon =
        selectedWeapon;


    const graph =
        document.getElementById(
            "decayGraph"
        );


    const width =
        700;


    const height =
        235;


    const padding =
        28;


    const range =
        Number(
            weapon.effectiveRange ??
            weapon.range
        ) || 5;


    const blast =
        Number(
            weapon.blast
        ) || 0;


    const maxDistance =
        Math.max(
            8,
            range +
            blast
        );


    const points = [];


    for (
        let i = 0;
        i <= 50;
        i++
    ) {

        const distance =
            maxDistance *
            i /
            50;


        const damage =
            getDamageAtDistance(
                weapon,
                distance
            );


        const x =
            padding +
            (
                width -
                padding * 2
            ) *
            i /
            50;


        const y =
            height -
            padding -
            (
                height -
                padding * 2
            ) *
            Math.min(
                180,
                damage
            ) /
            180;


        points.push(
            `${x},${y}`
        );

    }


    graph.innerHTML = `

        <svg
            class="decay-svg"
            viewBox="
                0
                0
                ${width}
                ${height}
            "
            preserveAspectRatio="none"
        >

            <polyline
                points="
                    ${points.join(" ")}
                "
                fill="none"
                stroke="#a84cff"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

        </svg>

    `;

}


/*
=========================================
ステータス
=========================================
*/

function renderStats() {

    const weapon =
        selectedWeapon;


    const data = [

        [
            "ダメージ",
            weapon.damage ?? "—"
        ],

        [
            "最低ダメージ",
            weapon.minimumDamage ?? "—"
        ],

        [
            "射程",
            weapon.range ?? "—"
        ],

        [
            "有効射程",
            weapon.effectiveRange ?? "—"
        ],

        [
            "爆風半径",
            weapon.blast
                ? weapon.blast +
                  " units"
                : "—"
        ],

        [
            "近距離爆風",
            weapon.nearBlast
                ? weapon.nearBlast +
                  " units"
                : "—"
        ],

        [
            "サブ",
            weapon.sub
        ],

        [
            "スペシャル",
            weapon.special
        ],

        [
            "SP",
            weapon.specialPoints
        ],

        [
            "インク消費",
            weapon.ink
        ]

    ];


    document.getElementById(
        "stats"
    ).innerHTML =
        data
            .map(
                item => `

                    <div
                        class="stat"
                    >

                        <span>
                            ${item[0]}
                        </span>


                        <strong>
                            ${item[1] ?? "—"}
                        </strong>

                    </div>

                `
            )
            .join("");

}


/*
=========================================
全部描画
=========================================
*/

function renderAll() {

    if (
        !selectedWeapon
    ) {

        return;

    }


    renderHeader();

    renderRange();

    renderBlast();

    renderDamage();

    renderDecay();

    renderStats();

}


/*
=========================================
Wikiから全武器をロード
=========================================
*/

async function loadWeapons() {

    try {

        setStatus(
            "Wiki接続中..."
        );


        setLoading(
            "武器一覧を取得中..."
        );


        const list =
            await getWeaponList();


        if (
            !list.length
        ) {

            throw new Error(
                "武器一覧が空です"
            );

        }


        setStatus(
            `${list.length} weapons`
        );


        const result = [];


        /*
        APIを一気に叩かず
        順番に取得する
        */

        for (
            let i = 0;
            i < list.length;
            i++
        ) {

            setLoading(
                `Wikiデータ取得中... ${i + 1} / ${list.length}`
            );


            try {

                const weapon =
                    await loadWeaponData(
                        list[i]
                    );


                if (
                    weapon
                ) {

                    result.push(
                        weapon
                    );

                }

            } catch (
                error
            ) {

                console.warn(
                    "Weapon load failed:",
                    list[i],
                    error
                );

            }

        }


        weapons =
            result.filter(
                weapon =>
                    weapon.type !==
                    "その他"
            );


        if (
            !weapons.length
        ) {

            throw new Error(
                "武器データを取得できませんでした"
            );

        }


        selectedWeapon =
            weapons.find(
                weapon =>
                    weapon.name ===
                    "Splattershot"
            ) ||
            weapons[0];


        renderCategories();

        renderWeaponList();

        renderAll();


        setStatus(
            `${weapons.length} weapons loaded`
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setStatus(
            "Wiki接続エラー"
        );


        document.getElementById(
            "weaponList"
        ).innerHTML = `

            <div class="loading">

                Wikiから
                データを取得できませんでした。

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


/*
=========================================
START
=========================================
*/

renderCategories();

loadWeapons();
